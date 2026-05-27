import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterInput } from '@shared/schemas';
import { useTranslation } from '../i18n/I18nProvider';
import { useRegister } from '../hooks/useRegister';
import { ErrorBanner } from './ErrorBanner';
import { Spinner } from './Spinner';
import { ApiError } from '../lib/api';
import type { Genero, NivelAcademico } from '@shared/types';

const generos: Genero[] = ['M', 'F', 'OTRO', 'PREFIERO_NO_DECIR'];
const niveles: NivelAcademico[] = [
  'SECUNDARIA',
  'PREGRADO',
  'POSGRADO',
  'OTRO',
];

export function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      genero: 'F',
      edad: 18,
      institucion: '',
      carrera: '',
      nivelAcademico: 'PREGRADO',
    },
  });

  async function onSubmit(values: RegisterInput) {
    try {
      const res = await mutation.mutateAsync(values);
      navigate('/confirmacion', {
        state: {
          participantNumber: res.participantNumber,
          nombre: values.nombre,
        },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'EMAIL_EXISTS') {
          setError('email', { message: t('register.error.email_exists') });
        } else if (err.code === 'VALIDATION_ERROR' && err.fields) {
          for (const [key, message] of Object.entries(err.fields)) {
            setError(key as keyof RegisterInput, { message });
          }
        }
      }
    }
  }

  const apiError =
    mutation.error instanceof ApiError
      ? mutation.error.code === 'EMAIL_EXISTS'
        ? null
        : mutation.error.code === 'VALIDATION_ERROR'
          ? t('register.error.validation')
          : t('register.error.generic')
      : mutation.isError
        ? t('register.error.generic')
        : null;

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {apiError && <ErrorBanner message={apiError} />}

      <div>
        <label className="label" htmlFor="nombre">
          {t('register.field.nombre')}
        </label>
        <input
          id="nombre"
          className="input"
          placeholder={t('register.placeholder.nombre')}
          {...register('nombre')}
        />
        {errors.nombre && (
          <p className="mt-1 text-xs text-red-600">{errors.nombre.message ?? t('common.invalid')}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">
            {t('register.field.email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder={t('register.placeholder.email')}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message ?? t('common.invalid')}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="telefono">
            {t('register.field.telefono')}
          </label>
          <input
            id="telefono"
            inputMode="tel"
            autoComplete="tel"
            className="input"
            placeholder={t('register.placeholder.telefono')}
            {...register('telefono')}
          />
          {errors.telefono && (
            <p className="mt-1 text-xs text-red-600">{errors.telefono.message ?? t('common.invalid')}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="genero">
            {t('register.field.genero')}
          </label>
          <select id="genero" className="input" {...register('genero')}>
            {generos.map((g) => (
              <option key={g} value={g}>
                {t(`genero.${g}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="edad">
            {t('register.field.edad')}
          </label>
          <input
            id="edad"
            type="number"
            min={13}
            max={99}
            className="input"
            {...register('edad', { valueAsNumber: true })}
          />
          {errors.edad && (
            <p className="mt-1 text-xs text-red-600">{errors.edad.message ?? t('common.invalid')}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="institucion">
            {t('register.field.institucion')}
          </label>
          <input
            id="institucion"
            className="input"
            placeholder={t('register.placeholder.institucion')}
            {...register('institucion')}
          />
          {errors.institucion && (
            <p className="mt-1 text-xs text-red-600">{errors.institucion.message ?? t('common.invalid')}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="carrera">
            {t('register.field.carrera')}
          </label>
          <input
            id="carrera"
            className="input"
            placeholder={t('register.placeholder.carrera')}
            {...register('carrera')}
          />
          {errors.carrera && (
            <p className="mt-1 text-xs text-red-600">{errors.carrera.message ?? t('common.invalid')}</p>
          )}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="nivelAcademico">
          {t('register.field.nivel')}
        </label>
        <select id="nivelAcademico" className="input" {...register('nivelAcademico')}>
          {niveles.map((n) => (
            <option key={n} value={n}>
              {t(`nivel.${n}`)}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="btn-primary w-full mt-2"
        disabled={isSubmitting || mutation.isPending}
      >
        {mutation.isPending || isSubmitting ? (
          <>
            <Spinner /> {t('register.submitting')}
          </>
        ) : (
          t('register.submit')
        )}
      </button>
    </form>
  );
}
