import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

const plataforma = [
  { label: "Para médicos", href: "https://www.medcoapp.com/medico" },
  { label: "Para pacientes", href: "https://www.medcoapp.com/paciente" },
  { label: "Criar conta", href: "https://www.medcoapp.com/cadastro" },
  { label: "Contato", href: "https://www.medcoapp.com/contato" },
];

const legal = [
  { label: "FAQ", href: "https://www.medcoapp.com/faq" },
  { label: "Termos de uso", href: "https://www.medcoapp.com/termos" },
  { label: "Política de privacidade", href: "https://www.medcoapp.com/privacidade" },
  { label: "Exclusão de dados", href: "https://www.medcoapp.com/exclusao-de-dados" },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#1844AA" }}>
      {/* Main footer */}
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="space-y-5">
            <Image
              src="/logo.svg"
              alt="Med.co"
              width={101}
              height={20}
              className="brightness-0 invert"
            />
            <p className="text-sm leading-relaxed" style={{ color: "#c5caf0" }}>
              A Med.co conecta médicos e pacientes para comunicação, Teleorientação e Telemonitoramento em um ambiente seguro.
            </p>

            {/* App Store buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="leading-tight">
                  <div style={{ fontSize: "9px", color: "#c5caf0" }}>Disponível na</div>
                  <div className="text-xs font-semibold">App Store</div>
                </div>
              </a>

              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5c.5.3.5 1.2 0 1.5L4.5 21c-.5.3-1.5.3-1.5-.5z" />
                </svg>
                <div className="leading-tight">
                  <div style={{ fontSize: "9px", color: "#c5caf0" }}>Disponível no</div>
                  <div className="text-xs font-semibold">Google Play</div>
                </div>
              </a>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { href: "https://instagram.com/medcoapp", icon: <InstagramIcon />, label: "Instagram" },
                { href: "https://facebook.com/medcoapp", icon: <FacebookIcon />, label: "Facebook" },
                { href: "https://linkedin.com/company/medcoapp", icon: <LinkedInIcon />, label: "LinkedIn" },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="mb-5 text-sm font-semibold text-white">Plataforma</h3>
            <ul className="space-y-3">
              {plataforma.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-opacity hover:opacity-80"
                    style={{ color: "#c5caf0" }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-5 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-3">
              {legal.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-opacity hover:opacity-80"
                    style={{ color: "#c5caf0" }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="mb-5 text-sm font-semibold text-white">Contato</h3>
            <a
              href="mailto:contato@medcoapp.com"
              className="flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
              style={{ color: "#c5caf0" }}
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              contato@medcoapp.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "#8a94cc" }}>
            © 2026 Med.co. Todos os direitos reservados.
          </p>
          <div className="text-right">
            <p className="text-xs font-medium" style={{ color: "#8a94cc" }}>
              Med.co Serviços de Conexão em Saúde LTDA
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6b75b8" }}>
              Av. Desembargador Moreira 1300 Fortaleza-CE, 60170-002
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6b75b8" }}>
              CNPJ 60.711.021/0001-47
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
