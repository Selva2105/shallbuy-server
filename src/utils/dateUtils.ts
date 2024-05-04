/**
 * Class to handle date and time operations.
 */
class DateTimeUtils {
  /**
   * Returns the current date and time in a formatted string.
   * @returns {string} - Formatted date and time (YYYY-MM-DD HH:mm:ss).
   */
  public static giveCurrentDateTime(): string {
    // Get the current date and time
    const today = new Date();

    // Extract year, month, and day components
    const date = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    // Extract hours, minutes, and seconds components
    const time = `${today.getHours().toString().padStart(2, '0')}:${today
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;

    // Combine date and time components into a formatted string
    const dateTime = `${date} ${time}`;

    return dateTime;
  }
}

export default DateTimeUtils;
