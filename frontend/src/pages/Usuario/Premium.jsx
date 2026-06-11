import { X, Check, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PremiumModal({
  isOpen,
  onClose
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[420px] rounded-xl p-6 relative">

        <button
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X />
        </button>

        <div className="flex justify-center">
          <div className="bg-yellow-400 p-4 rounded-full">
            <Crown size={40} color="white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mt-6">
          Hazte Premium
        </h2>

        <p className="text-center text-gray-500 mt-2">
          Desbloquea todo el potencial de U Conecta
        </p>

        <div className="text-center mt-8">
          <span className="text-5xl font-bold text-teal-700">
            $99.99
          </span>

          <span className="text-xl text-gray-500">
            /mes
          </span>

          <p className="text-sm text-gray-500 mt-2">
            Cancela cuando quieras
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">

          {[
            "Dashboard analítico avanzado",
            "Reportes personalizados",
            "Integración con sistemas externos",
            "API de acceso",
            "Capacitación ilimitada",
            "Gestor de cuenta dedicado"
          ].map(item => (
            <div
              key={item}
              className="border border-green-300 rounded-lg p-3 flex gap-2"
            >
              <Check
                className="text-green-600"
                size={18}
              />

              <span className="text-sm">
                {item}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Quizás más tarde
          </button>

          <button
            onClick={() =>
              navigate("/premium/checkout")
            }
            className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg font-medium"
          >
            Suscribirme Ahora
          </button>

        </div>
      </div>
    </div>
  );
}