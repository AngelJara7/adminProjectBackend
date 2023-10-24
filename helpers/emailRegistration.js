import nodemailer from "nodemailer";

const emailRegistration = async(data) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // construyendo emial de confirmación de cuenta al usuario

    const { email, nombre, token } = data;

    const info = await transporter.sendMail({
        from: "SPM - Project Management System",
        to: email,
        subject: "Confirma tu cuenta en SPM",
        text: "Confirma tu cuenta en SPM",
        html: `<p>Hola ${nombre}, confirma tu cuenta.</p>
            <p>Tu cuenta ha sido creada con exitó, para continuar confirma tu email en el siguiente enlace: <a href="${process.env.FRONTEND_URL}/auth/confirm-account/${token}">Confirmar Cuenta</p>
            
            <p>Si no has creado un cuenta con nosotros, por ignora este mensaje.</p>`
    });

    console.log('Enviado %s', info.messageId);
}

export default emailRegistration;