import { Clock3, MapPin, Phone } from 'lucide-react'
import { navigate } from '../router'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__letter">
        <div className="footer__sign">
          <p className="footer__closing">Sampai jumpa di meja makan.</p>
          <div className="brand brand--footer">
            <span className="brand__mark" aria-hidden="true">R</span>
            <span className="brand__name">
              Rasa<span className="brand__dot">.</span>
            </span>
          </div>
          <p className="footer__note">
            Masakan rumahan dengan bahan segar, dimasak saat dipesan. Antar hangat
            ke rumahmu.
          </p>
          <div className="footer__social">
            <span>Instagram: @rasa.dapur</span>
            <span>TikTok: @rasa.dapur</span>
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
            <Clock3 size={16} /> Setiap hari, 09.00 sampai 21.00
          </p>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Rasa Dapur. Dibuat dengan cinta.</span>
        <span>Demo aplikasi pemesanan makanan</span>
        <p className="footer__credits" data-credits>
          Foto: “Cooking a paella” oleh Jebulon (CC0) dan “Bumbu dan
          rempah-rempah” oleh Galeri ega (CC BY-SA 4.0), via Wikimedia Commons.
        </p>
      </div>
    </footer>
  )
}
