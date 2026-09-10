import { useEffect } from 'react'
import { Hero } from './Hero'
import { LogoStrip } from './LogoStrip'
import { ViewsSwitcher } from './ViewsSwitcher'
import { Flow } from './Flow'
import { Metrics } from './Metrics'
import { FleetStatusStrip } from './FleetStatusStrip'
import { Features } from './Features'
import { Pricing } from './Pricing'
import { ProductsShowcase } from './ProductsShowcase'
import { Faq } from './Faq'
import { CtaBand } from './CtaBand'
import './landing.css'

const REVEAL_THRESHOLD = 0.15

function useRevealOnScroll() {
  useEffect(() => {
    const revealImmediately =
      !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches

    const seen = new WeakSet<Element>()
    const io = revealImmediately
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('in')
                io?.unobserve(entry.target)
              }
            })
          },
          { threshold: REVEAL_THRESHOLD },
        )

    function observeNew() {
      document.querySelectorAll('.rv').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        if (revealImmediately) el.classList.add('in')
        else io?.observe(el)
      })
    }

    observeNew()
    const mo = new MutationObserver(observeNew)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io?.disconnect()
      mo.disconnect()
    }
  }, [])
}

export default function LandingPage() {
  useRevealOnScroll()

  return (
    <>
      <Hero />
      <LogoStrip />
      <ViewsSwitcher />
      <Flow />
      <Metrics />
      <FleetStatusStrip />
      <Features />
      <Pricing />
      <ProductsShowcase />
      <Faq />
      <CtaBand />
    </>
  )
}
