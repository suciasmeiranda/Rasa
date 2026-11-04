import { Clock3, MapPin, Phone } from 'lucide-react'
import { navigate } from '../router'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <div className="brand brand--footer">
            <span className="brand__mark">🍜</span>
            <span className="brand__name">
              Rasa<span>.</span>
            </span>
          </div>
          <p>
            Masakan rumahan dengan bahan segar, dimasak saat dipesan. Antar hangat
            ke rumahmu.
          </p>
          <div className="footer__social">
            <span>IG @rasa.dapur</span>
            <span>•</span>
            <span>TikTok @rasa.dapur</span>
          </div>
        </div>

        <div className="footer__col">
          <h3>Jelajahi</h3>
          <button type="button" onClick={() => navigate('/')}>
            Menu lengkap
          </button>
          <button type="button" onClick={() => navigate('/pesanan')}>
            Pesanan saya
          </button>
          <button type="button" onClick={() => navigate('/admin')}>
            Panel admin
          </button>
        </div>

        <div className="footer__col">
          <h3>Hubungi kami</h3>
          <p className="footer__line">
            <MapPin size={16} /> Jl. Kemang Raya No. 8, Jakarta Selatan
          </p>
          <p className="footer__line">
            <Phone size={16} /> 0812-9000-1234
          </p>
          <p className="footer__line">
            <Clock3 size={16} /> Setiap hari, 09.00–21.00
          </p>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Rasa Dapur. Dibuat dengan cinta.</span>
        <span>Demo aplikasi pemesanan makanan</span>
      </div>
    </footer>
  )
}
