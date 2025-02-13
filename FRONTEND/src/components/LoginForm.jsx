import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import '../styles/LoginForm.css'
const LoginForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    //formik
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Podaj poprawny adres e-mail')
                .required('Adres e-mail jest wymagany'),
            password: Yup.string()
                .required('Hasło jest wymagane'),
        }),
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                const response = await fetch('http://localhost:5000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Błąd logowania');
                }

                login(data.user, data.token);
                navigate('/'); //wracamy do / 
            } catch (err) {
                setFieldError('general', err.message || 'Błąd połączenia z serwerem');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="login-container">
            <h2>Logowanie</h2>
            {formik.errors.general && <div className="error-message">{formik.errors.general}</div>}
            
            <form onSubmit={formik.handleSubmit} className="login-form">
               {/* email */}
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        className={formik.touched.email && formik.errors.email ? 'error' : ''}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className="error-message">{formik.errors.email}</div>
                    )}
                </div>
                
               {/* Password */}
                <div className="form-group">
                    <label htmlFor="password">Hasło:</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                        className={formik.touched.password && formik.errors.password ? 'error' : ''}
                    />
                    {formik.touched.password && formik.errors.password && (
                        <div className="error-message">{formik.errors.password}</div>
                    )}
                </div>
                
                {/* Submit Button */}
                <button className="btn btn-primary" type="submit" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
                </button>
            </form>
            
            {/* Register Link */}
            <div className="register-link">
                Nie masz konta? <Link to="/signup">Zarejestruj się</Link>
            </div>
        </div>
    );
};

export default LoginForm;
