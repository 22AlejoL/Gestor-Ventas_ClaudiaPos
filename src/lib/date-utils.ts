// Utilidad para manejar fechas en zona horaria de Bogotá, Colombia (GMT-5)

const BOGOTA_TIMEZONE = 'America/Bogota';
const BOGOTA_OFFSET = -5; // GMT-5

/**
 * Obtiene la fecha actual en zona horaria de Bogotá
 */
export const getBogotaDate = (): Date => {
  const now = new Date();
  // Convertir a string en zona horaria de Bogotá y crear nueva fecha
  const bogotaString = now.toLocaleString('en-US', {
    timeZone: BOGOTA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  return new Date(bogotaString);
};

/**
 * Formatea una fecha para mostrar en zona horaria de Bogotá
 */
export const formatBogotaDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    timeZone: BOGOTA_TIMEZONE,
    ...options
  });
};

/**
 * Formatea una fecha y hora para mostrar en zona horaria de Bogotá
 */
export const formatBogotaDateTime = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-ES', {
    timeZone: BOGOTA_TIMEZONE,
    ...options
  });
};

/**
 * Obtiene la fecha de hoy en formato ISO (YYYY-MM-DD) en zona horaria de Bogotá
 */
export const getBogotaTodayISO = (): string => {
  const bogota = getBogotaDate();
  return bogota.toISOString().split('T')[0];
};

/**
 * Convierte una fecha ISO a la fecha correspondiente en Bogotá
 * Esto es importante porque una fecha ISO puede representar días diferentes
 * dependiendo de la zona horaria
 */
export const getBogotaDateFromISO = (isoString: string): Date => {
  // Si la fecha ya viene sin tiempo, asumimos que es medianoche en Bogotá
  if (isoString.includes('T')) {
    return new Date(isoString);
  }
  // Si solo es fecha (YYYY-MM-DD), crear fecha a las 00:00 en Bogotá
  return new Date(`${isoString}T00:00:00-05:00`);
};

/**
 * Obtiene el inicio del día en Bogotá (00:00:00)
 */
export const getStartOfDayBogota = (date: Date | string = new Date()): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const bogotaString = d.toLocaleString('en-US', {
    timeZone: BOGOTA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [month, day, year] = bogotaString.split('/');
  return new Date(`${year}-${month}-${day}T00:00:00-05:00`);
};

/**
 * Obtiene el fin del día en Bogotá (23:59:59)
 */
export const getEndOfDayBogota = (date: Date | string = new Date()): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const bogotaString = d.toLocaleString('en-US', {
    timeZone: BOGOTA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [month, day, year] = bogotaString.split('/');
  return new Date(`${year}-${month}-${day}T23:59:59-05:00`);
};

/**
 * Compara si dos fechas son el mismo día en Bogotá
 */
export const isSameDayBogota = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const bogota1 = d1.toLocaleDateString('en-US', { timeZone: BOGOTA_TIMEZONE });
  const bogota2 = d2.toLocaleDateString('en-US', { timeZone: BOGOTA_TIMEZONE });
  
  return bogota1 === bogota2;
};

/**
 * Obtiene una fecha relativa a hoy en Bogotá
 * @param days - Número de días a restar (negativo) o sumar (positivo)
 */
export const getRelativeDateBogota = (days: number): Date => {
  const today = getBogotaDate();
  today.setDate(today.getDate() + days);
  return today;
};

/**
 * Obtiene el nombre del día en Bogotá
 */
export const getDayNameBogota = (date: Date | string): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const d = typeof date === 'string' ? new Date(date) : date;
  const bogotaDate = new Date(d.toLocaleString('en-US', { timeZone: BOGOTA_TIMEZONE }));
  return days[bogotaDate.getDay()];
};

/**
 * Obtiene el mes corto en Bogotá
 */
export const getShortMonthBogota = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-ES', { 
    timeZone: BOGOTA_TIMEZONE,
    month: 'short' 
  }).replace(/\./g, '').replace(/^\w/, c => c.toUpperCase());
};
