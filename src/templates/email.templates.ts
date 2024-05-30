
const emailTemplates = {

  // Email de confirmacion
  confirmEmail: async (email: string, fullname: string, code: string) => {
    return {
      from: 'Administrador de Asistencias',
      to: email,
      subject: 'Confirmar email',
      text: `Para confirmar tu correo electrónico usa el siguiente código: ${code}`,
      html: `
        <div style="
          background-color: #63318A33;
          color: gray;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          width: 80%;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          font-family: Arial, sans-serif;
          font-size: 16px;
        ">
          <h1 style="margin-top: 0;">Hola ${fullname},</h1>
          <p style="
            color: gray;
            font-size: 18px;
            text-align: center;
          ">
            Para confirmar tu correo electrónico usa el siguiente código:
          </p>
          <div style="
            background-color: #63318A;
            color: white;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
            font-family: Arial, sans-serif;
            font-size: 48px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100px; 
          ">
            ${code}
          </div>
        </div>
      `
    };
  },

  // Email de recuperación de contraseña
  forgotPassword: async (email: string, code: string) => {
    return {
      from: 'Administrador de Asistencias',
      to: email,
      subject: 'Recuperar contraseña',
      text: `Para recuperar tu contraseña usa el siguiente código: ${code}`,
      html: `
        <div style="
          background-color: #63318A33;
          color: gray;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          width: 80%;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          font-family: Arial, sans-serif;
          font-size: 16px;
        ">
          <h1 style="margin-top: 0;">Recuperar contraseña</h1>
          <p style="
            color: gray;
            font-size: 18px;
            text-align: center;
          ">
            Para recuperar tu contraseña usa el siguiente código:
          </p>
          <div style="
            background-color: #63318A;
            color: white;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
            font-family: Arial, sans-serif;
            font-size: 48px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100px;
          ">
            ${code}
          </div>
          <p style="
            color: gray;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
          ">
            Si no solicitaste recuperar tu contraseña, por favor ignora este correo o contacta con el soporte.
          </p>
        </div>
      `
    };
  }


};

export default emailTemplates;
