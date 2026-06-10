/* Login screen */

const LoginPage = () => {
  const { login } = window.useAppContext();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const ready = email.trim() && password.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || loading) return;
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-hero">
        <div className="login-hero-top">
          <div className="login-accent-bar"></div>
          <div>
            <div className="login-eyebrow">Bienvenido a</div>
            <h1 className="login-hero-title">SISTEMA SAC</h1>
          </div>
        </div>
        <div className="login-hero-bottom">
          <div className="login-campus-label">Campus</div>
          <div className="login-campus-name">Lima Norte</div>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-card">
          <div className="login-brand-chip">
            <Icon name="shield-check" size={18} />
            <span>Sistema SAC</span>
          </div>

          <h2 className="login-title">Iniciar sesion</h2>
          <p className="login-subtitle">Ingrese sus credenciales para continuar.</p>

          <form className="login-form" onSubmit={submit} noValidate>
            <div className="login-field">
              <input
                value={email}
                type="email"
                placeholder="Correo institucional *"
                autoComplete="username"
                onChange={e => { setEmail(e.target.value); setError(''); }}
                disabled={loading}
              />
              <Icon name="users" size={18} className="login-lead-icon" />
            </div>

            <div className="login-field">
              <input
                value={password}
                type={showPassword ? 'text' : 'password'}
                placeholder="Contrasena *"
                autoComplete="current-password"
                onChange={e => { setPassword(e.target.value); setError(''); }}
                disabled={loading}
              />
              <Icon name="lock" size={18} className="login-lead-icon" />
              <button
                type="button"
                className="login-toggle-eye"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
              </button>
            </div>

            <div className={'login-error' + (error ? ' show' : '')} role="alert">
              <Icon name="alert" size={17} />
              <span>{error}</span>
            </div>

            <div className="login-forgot">
              <button type="button" onClick={() => setError('Solicite el restablecimiento al coordinador del sistema.')}>
                Olvidaste tu contrasena?
              </button>
            </div>

            <button type="submit" className={'login-submit' + (ready ? ' active' : '')} disabled={!ready || loading}>
              {loading && <span className="spinner" aria-hidden="true"></span>}
              <span>{loading ? 'Verificando...' : 'Iniciar sesion'}</span>
            </button>
          </form>

          <div className="login-footer">
            Sistema de Gestion de Calidad <span>·</span> ISO 9001:2015
          </div>
        </div>
      </section>
    </main>
  );
};

window.LoginPage = LoginPage;
