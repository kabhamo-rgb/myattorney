/* Google Analytics 4 — נקודת הגדרה אחת.
   החלף G-XXXXXXXXXX במזהה המדידה שלך מ-GA4 (מתחיל ב-G-). זה הקובץ היחיד שצריך לערוך.
   כל עוד לא הוחלף — הסקריפט לא עושה כלום (no-op). */
(function () {
  var ID = 'G-XXXXXXXXXX';
  if (!ID || ID.indexOf('G-') !== 0 || ID === 'G-XXXXXXXXXX') return; // לא הוגדר עדיין
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ID);
})();
