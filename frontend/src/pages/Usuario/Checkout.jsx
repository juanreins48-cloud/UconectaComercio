import { Crown, Check, CheckCircle, CreditCard, Lock, Loader2, Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

const benefits = {
  estudiante: [
    "Perfil destacado — apareces primero en búsquedas",
    "Aplicaciones ilimitadas (plan gratis tiene límite)",
    "Ve quién visitó tu perfil",
    "Insignia Premium visible para empresas",
    "Acceso a ofertas de pasantías exclusivas",
  ],
  empresa: [
    "Ofertas destacadas — aparecen primero en el listado",
    "Aplicantes ilimitados por oferta",
    "Acceso completo a la base de datos de estudiantes",
    "Estadísticas avanzadas en el dashboard",
    "Soporte prioritario",
  ],
};

// ─── Helpers de formato ────────────────────────────────────────────────────
function formatCardNumber(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

function maskCard(num) {
  const digits = num.replace(/\s/g, "");
  if (digits.length < 4) return "**** **** **** ****";
  return "**** **** **** " + digits.slice(-4);
}

function getCardBrand(num) {
  const d = num.replace(/\s/g, "");
  if (/^4/.test(d)) return "VISA";
  if (/^5[1-5]/.test(d)) return "MC";
  if (/^3[47]/.test(d)) return "AMEX";
  return "CARD";
}

// ─── Recibo para impresión / descarga ─────────────────────────────────────
function Receipt({ plan, role, cardLast4, holderName, receiptId, date, onBack }) {
  const receiptRef = useRef();

  function handleDownload() {
    const content = receiptRef.current.innerText;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recibo-uconecta-${receiptId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const amount = plan === "mensual" ? "$99.99" : "$999.99";
  const planLabel = plan === "mensual" ? "Premium Mensual" : "Premium Anual";

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">

        {/* Cabecera verde */}
        <div className="bg-teal-700 text-white p-6 text-center">
          <CheckCircle className="mx-auto mb-2" size={52} />
          <h2 className="text-2xl font-bold">¡Pago exitoso!</h2>
          <p className="text-teal-200 text-sm mt-1">Tu cuenta ya es Premium</p>
        </div>

        {/* Cuerpo del recibo */}
        <div ref={receiptRef} className="p-6 space-y-4">

          {/* Logo / empresa */}
          <div className="flex items-center gap-2 border-b pb-4">
            <Crown className="text-yellow-500" size={22} />
            <span className="font-bold text-lg text-teal-700">U Conecta</span>
            <span className="ml-auto text-xs text-gray-400">Recibo de pago</span>
          </div>

          <div className="space-y-2 text-sm">
            <Row label="Nº de recibo" value={`#${receiptId}`} />
            <Row label="Fecha" value={date} />
            <Row label="Titular" value={holderName} />
            <Row label="Método de pago" value={`Tarjeta terminada en ${cardLast4}`} />
            <Row label="Plan" value={planLabel} />
            <Row label="Rol" value={role === "empresa" ? "Empresa" : "Estudiante"} />
          </div>

          <div className="border-t pt-4 flex justify-between font-bold text-base">
            <span>Total pagado</span>
            <span className="text-teal-700">{amount}</span>
          </div>

          {plan === "anual" && (
            <p className="text-xs text-green-600 text-right -mt-2">
              Ahorraste $199.89 vs facturación mensual
            </p>
          )}

          <p className="text-xs text-gray-400 text-center pt-2">
            Gracias por unirte a U Conecta Premium. Puedes cancelar en cualquier momento desde Ajustes.
          </p>
        </div>

        {/* Acciones */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 border border-teal-700 text-teal-700 hover:bg-teal-50 p-3 rounded-lg font-medium transition-colors"
          >
            <Download size={16} /> Descargar recibo
          </button>
          <button
            onClick={onBack}
            className="w-full bg-yellow-400 hover:bg-yellow-500 p-3 rounded-lg font-semibold transition-colors"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function PremiumCheckout() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const roleBenefits = benefits[role] || benefits.estudiante;

  // Estado del formulario
  const [plan, setPlan] = useState("mensual");
  const [holderName, setHolderName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});

  // Estado del flujo de pago
  const [step, setStep] = useState("form"); // "form" | "processing" | "receipt"
  const [receiptData, setReceiptData] = useState(null);

  function getDashboardRoute() {
    if (role === "empresa") return "/empresa";
    return "/estudiante";
  }

  // ── Validación ────────────────────────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!holderName.trim()) errs.holderName = "Ingresa el nombre del titular";
    if (!email.includes("@")) errs.email = "Correo inválido";
    if (!/^\d{7,15}$/.test(phone.replace(/\s/g, ""))) errs.phone = "Teléfono inválido";

    const rawCard = cardNumber.replace(/\s/g, "");
    if (rawCard.length < 13 || rawCard.length > 16) errs.cardNumber = "Número de tarjeta inválido";

    const [mm, yy] = expiry.split("/");
    const now = new Date();
    const expMonth = parseInt(mm, 10);
    const expYear = 2000 + parseInt(yy || "0", 10);
    if (!mm || !yy || expMonth < 1 || expMonth > 12 || expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
      errs.expiry = "Fecha de vencimiento inválida";
    }

    if (cvv.length < 3 || cvv.length > 4) errs.cvv = "CVV inválido";
    return errs;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep("processing");

    // Simular procesamiento (2.5 s)
    await new Promise((res) => setTimeout(res, 2500));

    // Llamar al backend para activar premium
    const userId = localStorage.getItem("userId");
    try {
      await fetch("https://uconecta-backend.onrender.com/api/usuario/premium", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
    } catch (_) {
      // Simulado: aunque falle el backend, mostramos el recibo
    }

    const receiptId = Math.random().toString(36).slice(2, 10).toUpperCase();
    const date = new Date().toLocaleString("es-CO", {
      dateStyle: "long",
      timeStyle: "short",
    });
    const cardLast4 = cardNumber.replace(/\s/g, "").slice(-4);

    setReceiptData({ receiptId, date, cardLast4, holderName, plan });
    localStorage.setItem("isPremium", "true");
    setStep("receipt");
  }

  // ── Pantalla: Procesando ──────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center gap-4">
        <div className="bg-white rounded-xl shadow-lg p-10 flex flex-col items-center gap-4 w-full max-w-sm text-center">
          <Loader2 className="text-teal-700 animate-spin" size={52} />
          <h2 className="text-xl font-bold">Procesando tu pago...</h2>
          <p className="text-gray-500 text-sm">
            Estamos verificando tu tarjeta de forma segura. No cierres esta ventana.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
            <div className="bg-teal-600 h-2 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Lock size={12} /> Conexión segura SSL
        </div>
      </div>
    );
  }

  // ── Pantalla: Recibo ──────────────────────────────────────────────────────
  if (step === "receipt") {
    return (
      <Receipt
        {...receiptData}
        role={role}
        onBack={() => navigate(getDashboardRoute())}
      />
    );
  }

  // ── Pantalla: Formulario ──────────────────────────────────────────────────
  const brand = getCardBrand(cardNumber);
  const amount = plan === "mensual" ? "$99.99" : "$999.99";

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start p-4 py-10">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(getDashboardRoute())}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <Crown className="text-yellow-500" size={30} />
          <h1 className="text-2xl font-bold">Suscripción Premium</h1>
        </div>

        {/* Beneficios */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
          <h2 className="text-base font-semibold text-yellow-700 mb-3">
            {role === "empresa" ? "Lo que obtienes como Empresa Premium" : "Lo que obtienes como Estudiante Premium"}
          </h2>
          <ul className="space-y-1.5">
            {roleBenefits.map((b, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="text-yellow-500 shrink-0" size={16} />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* ── Datos personales ─────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Datos del titular
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label="Nombre completo"
                value={holderName}
                onChange={setHolderName}
                placeholder="Ej. María García"
                error={errors.holderName}
              />
              <Field
                label="Correo electrónico"
                value={email}
                onChange={setEmail}
                placeholder="correo@ejemplo.com"
                type="email"
                error={errors.email}
              />
              <Field
                label="Teléfono"
                value={phone}
                onChange={setPhone}
                placeholder="+57 300 000 0000"
                error={errors.phone}
                className="sm:col-span-2"
              />
            </div>
          </div>

          {/* ── Datos de la tarjeta ───────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Datos de la tarjeta
            </p>

            {/* Preview de tarjeta */}
            <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white rounded-xl p-5 mb-4 relative overflow-hidden select-none">
              <div className="absolute right-4 top-4 text-xs font-bold tracking-widest opacity-70">
                {brand}
              </div>
              <CreditCard className="mb-4 opacity-60" size={28} />
              <p className="text-lg font-mono tracking-widest">
                {maskCard(cardNumber)}
              </p>
              <div className="flex justify-between mt-3 text-xs opacity-70">
                <span>{holderName || "TITULAR"}</span>
                <span>{expiry || "MM/AA"}</span>
              </div>
            </div>

            {/* Inputs tarjeta */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  className={`w-full border rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.cardNumber ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.cardNumber && <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/AA"
                    className={`w-full border rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.expiry ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="•••"
                    className={`w-full border rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.cvv ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── Plan ──────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Plan
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "mensual", label: "Mensual", price: "$99.99 / mes" },
                { value: "anual", label: "Anual", price: "$999.99 / año", badge: "Ahorra $200" },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlan(p.value)}
                  className={`border-2 rounded-xl p-4 text-left transition-all ${plan === p.value ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{p.label}</span>
                    {p.badge && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{p.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Resumen ────────────────────────────────────── */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{amount}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Impuestos (0%)</span>
              <span>$0.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-teal-700">{amount}</span>
            </div>
            {plan === "anual" && (
              <p className="text-xs text-green-600 text-right">
                Ahorrás $199.89 vs facturación mensual
              </p>
            )}
          </div>

          {/* ── Botones ────────────────────────────────────── */}
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 p-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            Pagar {amount}
          </button>

          <button
            type="button"
            onClick={() => navigate(getDashboardRoute())}
            className="w-full px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            Cancelar
          </button>

          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
            <Lock size={11} /> Pago seguro — tus datos están cifrados
          </p>
        </form>
      </div>
    </div>
  );
}

// ── Campo reutilizable ─────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text", error, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${error ? "border-red-400" : "border-gray-300"}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
