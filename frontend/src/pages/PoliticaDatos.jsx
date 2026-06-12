import React from "react";

export default function PoliticaDatos() {
  return (
    <div className="max-w-5xl mx-auto p-8 text-gray-800">

      <h1 className="text-3xl font-bold mb-6 text-teal-800">
        Política de Tratamiento de Datos Personales — UConecta
      </h1>

      <p className="mb-3">
        <b>Responsable del tratamiento:</b> UConecta
      </p>

      <p className="mb-3">
        <b>Correo de contacto:</b> UConecta@gmail.com
      </p>

      <p className="mb-8">
        <b>Marco legal:</b> Ley 1581 de 2012 y Decreto 1377 de 2013 (Colombia)
      </p>


      <h2 className="text-xl font-bold mt-6 mb-3">
        ¿Qué datos recopilamos?
      </h2>

      <p>
        UConecta recopila los siguientes datos personales según el tipo de usuario:
      </p>

      <ul className="list-disc ml-8 mt-3">
        <li>
          <b>Estudiantes:</b> nombre, correo electrónico, contraseña,
          teléfono, información académica, experiencia laboral, habilidades
          y hoja de vida (CV).
        </li>

        <li>
          <b>Empresas:</b> nombre de la empresa, correo electrónico,
          contraseña y ofertas de pasantías publicadas.
        </li>

        <li>
          <b>Universidades:</b> nombre de la institución, correo electrónico
          y contraseña.
        </li>
      </ul>


      <h2 className="text-xl font-bold mt-6 mb-3">
        ¿Para qué usamos sus datos?
      </h2>

      <p>
        Los datos recopilados se utilizan exclusivamente para:
      </p>

      <ul className="list-disc ml-8 mt-3">
        <li>Crear y gestionar su cuenta en la plataforma.</li>
        <li>
          Conectar estudiantes con empresas que ofrecen oportunidades de pasantía.
        </li>
        <li>
          Permitir a las empresas revisar perfiles y hojas de vida.
        </li>
        <li>
          Enviar notificaciones sobre aplicaciones a pasantías.
        </li>
        <li>
          Mejorar los servicios y funcionalidades de UConecta.
        </li>
      </ul>


      <h2 className="text-xl font-bold mt-6 mb-3">
        ¿Con quién compartimos sus datos?
      </h2>

      <p>
        UConecta no vende ni cede sus datos personales a terceros.
      </p>

      <ul className="list-disc ml-8 mt-3">
        <li>
          Las empresas registradas podrán ver perfiles y CV de estudiantes
          que apliquen a sus ofertas.
        </li>

        <li>
          Las universidades registradas podrán consultar estadísticas generales.
        </li>
      </ul>


      <h2 className="text-xl font-bold mt-6 mb-3">
        ¿Por cuánto tiempo conservamos sus datos?
      </h2>

      <p>
        Sus datos serán conservados mientras la cuenta permanezca activa.
        Si desea eliminar su información puede solicitarlo escribiendo a
        UConecta@gmail.com.
      </p>


      <h2 className="text-xl font-bold mt-6 mb-3">
        Sus derechos
      </h2>

      <p>
        De acuerdo con la Ley 1581 de 2012 usted tiene derecho a:
      </p>

      <ul className="list-disc ml-8 mt-3">
        <li>Conocer los datos que tenemos sobre usted.</li>
        <li>Actualizar o corregir su información.</li>
        <li>Solicitar la eliminación de sus datos.</li>
        <li>Revocar la autorización del tratamiento de datos.</li>
      </ul>


      <h2 className="text-xl font-bold mt-6 mb-3">
        Seguridad
      </h2>

      <p>
        UConecta implementa medidas de seguridad para proteger la información,
        incluyendo cifrado de contraseñas y autenticación mediante tokens seguros.
      </p>


    </div>
  );
}