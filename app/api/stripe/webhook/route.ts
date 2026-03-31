import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await connectDB()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) break

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        await User.findByIdAndUpdate(userId, {
          'subscription.status': subscription.status === 'active' ? 'active' : subscription.status,
          'subscription.stripeSubscriptionId': subscription.id,
          'subscription.stripeCustomerId': subscription.customer as string,
          'subscription.currentPeriodEnd': new Date(
            (subscription as unknown as { current_period_end: number }).current_period_end * 1000
          ),
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        if (customer.deleted) break

        const userId = (customer as Stripe.Customer).metadata?.userId
        if (!userId) {
          // Try finding by stripeCustomerId
          const user = await User.findOne({
            'subscription.stripeCustomerId': subscription.customer as string,
          })
          if (user) {
            let status: 'active' | 'past_due' | 'canceled' | 'none' = 'none'
            if (subscription.status === 'active') status = 'active'
            else if (subscription.status === 'past_due') status = 'past_due'
            else if (subscription.status === 'canceled') status = 'canceled'

            user.subscription.status = status
            user.subscription.stripeSubscriptionId = subscription.id
            user.subscription.currentPeriodEnd = new Date(
              (subscription as unknown as { current_period_end: number }).current_period_end * 1000
            )
            await user.save()
          }
          break
        }

        let status: 'active' | 'past_due' | 'canceled' | 'none' = 'none'
        if (subscription.status === 'active') status = 'active'
        else if (subscription.status === 'past_due') status = 'past_due'
        else if (subscription.status === 'canceled') status = 'canceled'

        await User.findByIdAndUpdate(userId, {
          'subscription.status': status,
          'subscription.stripeSubscriptionId': subscription.id,
          'subscription.currentPeriodEnd': new Date(
            (subscription as unknown as { current_period_end: number }).current_period_end * 1000
          ),
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const user = await User.findOne({
          'subscription.stripeSubscriptionId': subscription.id,
        })
        if (user) {
          user.subscription.status = 'canceled'
          await user.save()
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as unknown as { subscription: string }).subscription
        if (subId) {
          const user = await User.findOne({
            'subscription.stripeSubscriptionId': subId,
          })
          if (user) {
            user.subscription.status = 'past_due'
            await user.save()
          }
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
