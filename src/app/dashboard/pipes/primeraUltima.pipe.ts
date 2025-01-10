import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'primeraUltima',
  standalone: true,
})
export class PrimeraUltimaPipe implements PipeTransform {

  transform(value: string): string {
    if (!value || value.length < 2) {
      return value; // Retorna el valor tal cual si es muy corto
    }
    const firstLetter = value.charAt(0);
    const lastLetter = value.charAt(value.length - 1);
    return `${firstLetter}${lastLetter}`;
  }
}
