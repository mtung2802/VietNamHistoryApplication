/**
 * Hàm utility để xử lý ngày tháng
 */

/**
 * Trích xuất năm từ timestamp (milliseconds hoặc seconds)
 * @param timestamp - Timestamp (dạng milliseconds hoặc seconds)
 * @returns Năm
 */
export const extractYearFromTimestamp = (timestamp: number): number => {
  try {
    // Nếu timestamp là seconds, chuyển thành milliseconds
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const date = new Date(ms);
    return date.getFullYear();
  } catch (error) {
    console.error('❌ Lỗi trích xuất năm từ timestamp:', error);
    return new Date().getFullYear();
  }
};

/**
 * Định dạng ngày theo định dạng được chỉ định
 * @param date - Đối tượng Date hoặc timestamp
 * @param format - Định dạng (vd: 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')
 * @returns Chuỗi ngày đã định dạng
 */
export const formatDate = (
  date: Date | number | string,
  format: string = 'DD/MM/YYYY',
): string => {
  try {
    let dateObj: Date;

    // Chuyển đổi input thành Date object
    if (typeof date === 'number') {
      // Nếu là timestamp (seconds < 10000000000, milliseconds > 10000000000)
      const ms = date < 10000000000 ? date * 1000 : date;
      dateObj = new Date(ms);
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) {
      console.warn('⚠️ Invalid date:', date);
      return '';
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    // Thay thế các placeholder trong format string
    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', String(year));
  } catch (error) {
    console.error('❌ Lỗi định dạng ngày:', error);
    return '';
  }
};

/**
 * Lấy ngày hôm nay ở định dạng chuỗi
 * @param format - Định dạng (vd: 'DD/MM/YYYY')
 * @returns Chuỗi ngày hôm nay
 */
export const getTodayAsString = (format: string = 'DD/MM/YYYY'): string => {
  return formatDate(new Date(), format);
};

/**
 * Kiểm tra xem hai ngày có phải cùng một ngày không
 * @param date1 - Ngày thứ nhất
 * @param date2 - Ngày thứ hai
 * @returns true nếu cùng ngày, false nếu khác
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Tính khoảng cách (số ngày) giữa hai ngày
 * @param date1 - Ngày thứ nhất
 * @param date2 - Ngày thứ hai
 * @returns Số ngày (dương nếu date1 > date2, âm nếu date1 < date2)
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // Milliseconds trong một ngày
  return Math.round((date1.getTime() - date2.getTime()) / oneDay);
};
