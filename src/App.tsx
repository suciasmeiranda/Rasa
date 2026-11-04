import { useState } from 'react'
import { StoreProvider } from './store/StoreContext'
import { useRoute } from './router'
import { Header, MobileNav, type NavKey } from './components/Header'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { CheckoutModal } from './components/CheckoutModal'
import { Toasts } from './components/Toasts'
import { MenuPage } from './pages/MenuPage'
import { OrdersPage } from './pages/OrdersPage'
import { AdminPage } from './pages/AdminPage'
import { SuccessPage } from './pages/SuccessPage'

function Shell() {
  const { route, navigate } = useRoute()
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const navKey: NavKey = route.name === 'success' ? 'orders' : route.name

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <Header active={navKey} onOpenCart={() => setCartOpen(true)} />

      <main id="main" className="main">
        {route.name === 'menu' && <MenuPage />}
        {route.name === 'orders' && (
          <OrdersPage onOpenCart={() => setCartOpen(true)} />
        )}
        {route.name === 'admin' && <AdminPage />}
        {route.name === 'success' && <SuccessPage orderId={route.orderId} />}
      </main>

      <Footer />
      <MobileNav active={navKey} onOpenCart={() => setCartOpen(true)} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={(orderId) => {
          setCheckoutOpen(false)
          navigate(`/sukses/${orderId}`)
        }}
      />

      <Toasts hidden={cartOpen || checkoutOpen} />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
