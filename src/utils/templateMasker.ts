/**
 * Utilities to preserve server-side templating (PHP, Blade, Twig)
 * and preamble/postamble blocks outside the <html> tag.
 */

export interface MaskedTemplateResult {
  preamble: string;
  maskedHtml: string;
  postamble: string;
  phpTokens: Map<string, string>;
}

const MONTH_NAMES_MAP: Record<string, Record<string, string>> = {
  ru: {
    January: 'января',
    February: 'февраля',
    March: 'марта',
    April: 'апреля',
    May: 'мая',
    June: 'июня',
    July: 'июля',
    August: 'августа',
    September: 'сентября',
    October: 'октября',
    November: 'ноября',
    December: 'декабря',
  },
  es: {
    January: 'enero',
    February: 'febrero',
    March: 'marzo',
    April: 'abril',
    May: 'mayo',
    June: 'junio',
    July: 'julio',
    August: 'agosto',
    September: 'septiembre',
    October: 'octubre',
    November: 'noviembre',
    December: 'diciembre',
  },
  de: {
    January: 'Januar',
    February: 'Februar',
    March: 'März',
    April: 'April',
    May: 'Mai',
    June: 'Juni',
    July: 'Juli',
    August: 'August',
    September: 'September',
    October: 'Oktober',
    November: 'November',
    December: 'Dezember',
  },
  ar: {
    January: 'يناير',
    February: 'فبراير',
    March: 'مارس',
    April: 'أبريل',
    May: 'مايو',
    June: 'يونيو',
    July: 'يوليو',
    August: 'أغسطس',
    September: 'سبتمبر',
    October: 'أكتوبر',
    November: 'نوفمبر',
    December: 'ديسمبر',
  },
  fr: {
    January: 'janvier',
    February: 'février',
    March: 'mars',
    April: 'avril',
    May: 'mai',
    June: 'juin',
    July: 'juillet',
    August: 'août',
    September: 'septembre',
    October: 'octobre',
    November: 'novembre',
    December: 'décembre',
  },
};

/**
 * Splits template into preamble (before <!DOCTYPE or <html), core HTML, and postamble (after </html>).
 * Masks all PHP and template tags so that DOMParser and JSON.parse can process the HTML safely.
 */
export function maskTemplateTags(rawContent: string): MaskedTemplateResult {
  const phpTokens = new Map<string, string>();
  let tokenCounter = 0;

  let content = rawContent;

  // 1. Separate preamble (code before <!DOCTYPE or <html)
  let preamble = '';
  let postamble = '';
  let coreHtml = content;

  const docStartMatch = content.match(/(<!DOCTYPE|<html[\s>])/i);
  if (docStartMatch && docStartMatch.index !== undefined && docStartMatch.index > 0) {
    preamble = content.slice(0, docStartMatch.index);
    coreHtml = content.slice(docStartMatch.index);
  }

  // 2. Separate postamble (code after </html>)
  const htmlEndMatch = coreHtml.match(/<\/html\s*>/i);
  if (htmlEndMatch && htmlEndMatch.index !== undefined) {
    const endPos = htmlEndMatch.index + htmlEndMatch[0].length;
    postamble = coreHtml.slice(endPos);
    coreHtml = coreHtml.slice(0, endPos);
  }

  // 3. Mask PHP tags inside coreHtml: <?php ... ?>, <?= ... ?>, <? ... ?>
  // We use alphanumeric placeholder format: __PHP_TOKEN_0__ so it is valid in JSON strings, attribute values, and text.
  coreHtml = coreHtml.replace(/<\?(?:php|=)?[\s\S]*?\?>/gi, (match) => {
    const token = `__PHP_TOKEN_${tokenCounter++}__`;
    phpTokens.set(token, match);
    return token;
  });

  return {
    preamble,
    maskedHtml: coreHtml,
    postamble,
    phpTokens,
  };
}

/**
 * Unmasks all PHP and template tags back into their exact original code,
 * and updates any language-specific preamble arrays if applicable.
 */
export function unmaskTemplateTags(
  html: string,
  phpTokens: Map<string, string>,
  preamble: string,
  postamble: string,
  targetLangCode: string
): string {
  let unmaskedHtml = html;

  // Restore PHP tags
  for (const [token, originalTag] of phpTokens.entries()) {
    // Replace all occurrences of token
    unmaskedHtml = unmaskedHtml.split(token).join(originalTag);
  }

  // Handle month array in preamble if present (e.g. $months_ar, $lastUpdated_ar)
  let updatedPreamble = preamble;
  if (preamble && (preamble.includes('$months_ar') || preamble.includes('$months_'))) {
    const targetMonths = MONTH_NAMES_MAP[targetLangCode];
    if (targetMonths) {
      const targetVar = `$months_${targetLangCode}`;
      const targetUpdatedVar = `$lastUpdated_${targetLangCode}`;

      // Update array definition
      updatedPreamble = updatedPreamble.replace(
        /\$months_[a-z]{2}\s*=\s*\[[\s\S]*?\];/i,
        () => {
          const lines = Object.entries(targetMonths)
            .map(([en, tr]) => `    '${en}' => '${tr}'`)
            .join(',\n');
          return `${targetVar} = [\n${lines}\n];`;
        }
      );

      // Update replacement line
      updatedPreamble = updatedPreamble.replace(
        /\$lastUpdated_[a-z]{2}\s*=\s*str_replace\(array_keys\(\$months_[a-z]{2}\),\s*array_values\(\$months_[a-z]{2}\),\s*\$lastUpdated\);/i,
        `${targetUpdatedVar} = str_replace(array_keys(${targetVar}), array_values(${targetVar}), $lastUpdated);`
      );

      // Update references in the unmasked HTML body: <?= $lastUpdated_ar ?> -> <?= $lastUpdated_{code} ?>
      unmaskedHtml = unmaskedHtml.replace(
        /<\?=\s*\$lastUpdated_[a-z]{2}\s*\?>/gi,
        `<?= ${targetUpdatedVar} ?>`
      );
    }
  }

  return `${updatedPreamble}${unmaskedHtml}${postamble}`;
}
