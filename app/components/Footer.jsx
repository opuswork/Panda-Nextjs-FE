// app/components/Footer.jsx

import Link from "next/link";
import Image from "next/image";
import { IMAGES } from "@/app/constants/images";

function Footer() {
  return (
    <div className="footerWrapper">
      <footer>
        <div className="footerCopyright">
          © codeit - {new Date().getFullYear()}
        </div>

        <div className="footerTopRow">
          <div id="footerMenu">
            {/* Use Next.js routes instead of .html if possible */}
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/faq">FAQ</Link>
          </div>

          <div id="socialMedia">
            <Link
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Image
                src={IMAGES.LOGO_FACEBOOK}
                alt="Facebook Logo"
                width={20}
                height={20}
                priority
              />
            </Link>

            <Link
              href="https://www.twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Image
                src={IMAGES.LOGO_TWITTER}
                alt="Twitter Logo"
                width={20}
                height={20}
                priority
              />
            </Link>

            <Link
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <Image
                src={IMAGES.LOGO_YOUTUBE}
                alt="YouTube Logo"
                width={20}
                height={20}
                priority
              />
            </Link>

            <Link
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Image
                src={IMAGES.LOGO_INSTAGRAM}
                alt="Instagram Logo"
                width={20}
                height={20}
                priority
              />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
