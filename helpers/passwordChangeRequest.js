import nodemailer from "nodemailer";

const passwordChangeRequest = async (data) => {

    // Creacion del transporte con las credenciales para el servicio de envio de la solicitud de cambio de contraseña
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_POST,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Envio de email
    const { email, nombre, token } = data;

    const info = await transporter.sendMail({
        from: 'SPM - Project Management System',
        to: email,
        subject: 'Solicitud de cambio de contraseña',
        text: 'Reestablece tu contraseña',
        html: `<p>Hola ${nombre}, parece que olvidaste tu contraseña y has solicitado un cambio.</p>
            <p>Presiona el siguiente enlace para generar una contraseña:
            <a href="${process.env.FRONTED_URL}/nueva-contraseña/${token}">Reestablece tu Contraseña</a> </p>
            
            <p>Si no has solicitado un cambio de contraseña ignora este mensaje.</p>`
    });

    console.log('Enviado: %s', info.messageId);
}

export default passwordChangeRequest;