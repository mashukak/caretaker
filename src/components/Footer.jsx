function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 13 4 6.01V6h16ZM4 18V8.236l7.385 6.154a1 1 0 0 0 1.23 0L20 8.236V18H4Z"
      />
    </svg>
  );
}

function IconPhone(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M6.62 10.79a15.09 15.09 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2Z"
      />
    </svg>
  );
}

function IconInstagram(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5.2-2.3a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
      />
    </svg>
  );
}

function IconTikTok(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M16 3c.3 2.6 1.8 4.1 4 4.4V10c-1.7-.1-3.2-.7-4-1.5v6.6c0 3-2.4 5.5-5.5 5.5S5 18.1 5 15.1s2.4-5.5 5.5-5.5c.4 0 .8 0 1.2.1v2.9c-.4-.2-.8-.3-1.2-.3-1.4 0-2.6 1.2-2.6 2.7 0 1.4 1.1 2.6 2.6 2.6s2.6-1.2 2.6-2.6V3h2.4Z"
      />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-wrap">
        <div className="footer-grid">
          {/* Brand + Support text */}
          <div className="footer-col">
            <h3 className="footer-brand">Caretaker</h3>
            <p className="footer-desc">
              Brauchen Sie Hilfe im Alltag? Rufen Sie uns an oder schreiben Sie uns.
              Unser Support-Team hilft schnell und zuverlässig. Folgen Sie uns auch
              auf Social Media, um Updates und Neuigkeiten nicht zu verpassen.
            </p>

            <div className="footer-contact">
              <a className="footer-link" href="mailto:caretaker.support@gmail.com">
                <span className="footer-ic">
                  <IconMail className="footer-ic-svg" />
                </span>
                caretaker.support@gmail.com
              </a>

              <a className="footer-link" href="tel:+49431662777971">
                <span className="footer-ic">
                  <IconPhone className="footer-ic-svg" />
                </span>
                +49 431 662777971
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="footer-col">
            <h4 className="footer-title">Social Media</h4>

            <div className="footer-social">
              <a
                className="footer-social-link"
                href=""
                target="_blank"
                rel="noreferrer"
              >
                <span className="footer-ic">
                  <IconInstagram className="footer-ic-svg" />
                </span>
                Instagram <span className="footer-handle">@caretaker</span>
              </a>

              <a
                className="footer-social-link"
                href=""
                target="_blank"
                rel="noreferrer"
              >
                <span className="footer-ic">
                  <IconTikTok className="footer-ic-svg" />
                </span>
                TikTok <span className="footer-handle">@caretaker</span>
              </a>
            </div>
          </div>

          {/* Team */}
          <div className="footer-col">
            <h4 className="footer-title">Projekt Team</h4>

            <div className="footer-team">
              <div className="footer-chip">Masha</div>
              <div className="footer-chip">Kristina</div>
              <div className="footer-chip">Hanna</div>
              <div className="footer-chip">Kalle</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Caretaker</span>
          <span className="footer-dot">•</span>
          <span>Schulprojekt</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
