export function formatDate(date: string): { year: string, monthDay: string } {
    const dateParts = date.split('-');

    let year: string;
    let monthDay: string;

    if (dateParts.length === 2) {
        year = new Date().getFullYear().toString(); 
        monthDay = dateParts[0] + '-' + dateParts[1]; 
    } else {
        const [inputYear, month, day] = dateParts;
        year = inputYear;
        monthDay = month + '-' + day; 
    }

    return { year, monthDay };
}