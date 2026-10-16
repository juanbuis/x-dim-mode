// Container app page. The extension itself lives in the appex; this window
// only says whether it's on and how to finish turning it on. Copy ships in
// the same ten locales as the extension; the tagline is each locale's
// extDescription. ViewController passes the Mac's preferred language, because
// the app bundle itself is English-only and WebKit would report "en".
const STRINGS = {
  "en": {
    "on": "X Dim Mode is on. Open x.com in Safari to see it.",
    "off": "X Dim Mode is off. Two quick steps to turn it on:",
    "step1": "In Safari Settings → Extensions, tick X Dim Mode.",
    "step2": "On x.com, click the X Dim Mode icon in the toolbar and choose “Always Allow on This Website”.",
    "hintOn": "Not seeing it? On x.com, click the X Dim Mode icon in the toolbar and choose “Always Allow on This Website”.",
    "button": "Open Safari Settings",
    "tagline": "Brings back the Dim dark blue theme X removed, plus the Twitter bird logo, classic font, and old image grid."
  },
  "de": {
    "on": "X Dim Mode ist aktiv. Öffne x.com in Safari, um es zu sehen.",
    "off": "X Dim Mode ist aus. So schaltest du es ein:",
    "step1": "Aktiviere X Dim Mode in den Safari-Einstellungen unter „Erweiterungen“.",
    "step2": "Klicke auf x.com in der Symbolleiste auf das X Dim Mode-Symbol und erlaube es dauerhaft für diese Website.",
    "hintOn": "Keine Änderung zu sehen? Klicke auf x.com in der Symbolleiste auf das X Dim Mode-Symbol und erlaube es dauerhaft für diese Website.",
    "button": "Safari-Einstellungen öffnen",
    "tagline": "Das von X entfernte dunkelblaue Dim ist zurück – mit Twitter-Vogel, alter Schrift und altem Bildraster."
  },
  "es": {
    "on": "X Dim Mode está activado. Abre x.com en Safari para verlo.",
    "off": "X Dim Mode está desactivado. Actívalo en dos pasos:",
    "step1": "En Ajustes de Safari → Extensiones, marca X Dim Mode.",
    "step2": "En x.com, haz clic en el icono de X Dim Mode de la barra de herramientas y permítelo siempre en este sitio web.",
    "hintOn": "¿No ves el cambio? En x.com, haz clic en el icono de X Dim Mode de la barra de herramientas y permítelo siempre en este sitio web.",
    "button": "Abrir Ajustes de Safari",
    "tagline": "Vuelve el tema Tenue azul oscuro que X quitó, con el pájaro de Twitter, la fuente y la cuadrícula de antes."
  },
  "fr": {
    "on": "X Dim Mode est activé. Ouvrez x.com dans Safari pour le voir.",
    "off": "X Dim Mode est désactivé. Deux étapes pour l’activer :",
    "step1": "Dans Réglages de Safari → Extensions, cochez X Dim Mode.",
    "step2": "Sur x.com, cliquez sur l’icône X Dim Mode dans la barre d’outils et autorisez-le toujours sur ce site.",
    "hintOn": "Rien ne change ? Sur x.com, cliquez sur l’icône X Dim Mode dans la barre d’outils et autorisez-le toujours sur ce site.",
    "button": "Ouvrir les réglages de Safari",
    "tagline": "Le thème Sombre bleu foncé retiré par X revient, avec l'oiseau Twitter, la police et la grille d'avant."
  },
  "ja": {
    "on": "X Dim Mode はオンです。Safari で x.com を開くと反映されます。",
    "off": "X Dim Mode はオフです。次の2ステップでオンにできます：",
    "step1": "Safari の設定 →「機能拡張」で X Dim Mode にチェックを入れます。",
    "step2": "x.com でツールバーの X Dim Mode アイコンをクリックし、このWebサイトで常に許可します。",
    "hintOn": "変化がない場合は、x.com でツールバーの X Dim Mode アイコンをクリックし、このWebサイトで常に許可してください。",
    "button": "Safari の設定を開く",
    "tagline": "Xが削除したダークブルーのDim背景を復元。Twitterの鳥ロゴ、クラシックなフォント、旧画像グリッドも。"
  },
  "ko": {
    "on": "X Dim Mode가 켜져 있습니다. Safari에서 x.com을 열어 확인하세요.",
    "off": "X Dim Mode가 꺼져 있습니다. 두 단계로 켤 수 있습니다:",
    "step1": "Safari 설정 → 확장 프로그램에서 X Dim Mode를 체크하세요.",
    "step2": "x.com에서 도구 막대의 X Dim Mode 아이콘을 클릭하고 이 웹사이트에서 항상 허용하세요.",
    "hintOn": "변화가 없나요? x.com에서 도구 막대의 X Dim Mode 아이콘을 클릭하고 이 웹사이트에서 항상 허용하세요.",
    "button": "Safari 설정 열기",
    "tagline": "X가 없앤 어두운 파란색 Dim 배경을 되살립니다. 트위터 새 로고, 클래식 글꼴, 옛 이미지 그리드까지."
  },
  "pt_BR": {
    "on": "O X Dim Mode está ativado. Abra o x.com no Safari para ver.",
    "off": "O X Dim Mode está desativado. Dois passos para ativar:",
    "step1": "Em Ajustes do Safari → Extensões, marque X Dim Mode.",
    "step2": "No x.com, clique no ícone do X Dim Mode na barra de ferramentas e permita sempre neste site.",
    "hintOn": "Não mudou nada? No x.com, clique no ícone do X Dim Mode na barra de ferramentas e permita sempre neste site.",
    "button": "Abrir Ajustes do Safari",
    "tagline": "Volta o tema Escurecido azul escuro que o X removeu, com o pássaro do Twitter, a fonte e a grade de antes."
  },
  "ru": {
    "on": "X Dim Mode включён. Откройте x.com в Safari, чтобы увидеть результат.",
    "off": "X Dim Mode выключен. Включите его в два шага:",
    "step1": "В настройках Safari → «Расширения» отметьте X Dim Mode.",
    "step2": "На x.com нажмите значок X Dim Mode на панели инструментов и всегда разрешайте его на этом сайте.",
    "hintOn": "Ничего не изменилось? На x.com нажмите значок X Dim Mode на панели инструментов и всегда разрешайте его на этом сайте.",
    "button": "Открыть настройки Safari",
    "tagline": "Возвращает тёмно-синий фон Dim, убранный X, плюс птицу Twitter, классический шрифт и старую сетку."
  },
  "zh_CN": {
    "on": "X Dim Mode 已开启。在 Safari 中打开 x.com 即可看到效果。",
    "off": "X Dim Mode 已关闭。只需两步即可开启：",
    "step1": "在 Safari 设置 →“扩展”中勾选 X Dim Mode。",
    "step2": "在 x.com 上点按工具栏中的 X Dim Mode 图标，并选择始终允许在此网站上使用。",
    "hintOn": "没有变化？在 x.com 上点按工具栏中的 X Dim Mode 图标，并选择始终允许在此网站上使用。",
    "button": "打开 Safari 设置",
    "tagline": "找回 X 移除的暗蓝色 Dim 背景，还有 Twitter 小鸟标志、经典字体和旧版图片网格。"
  },
  "ar": {
    "on": "X Dim Mode مفعّل. افتح x.com في Safari لترى النتيجة.",
    "off": "X Dim Mode متوقف. فعّله بخطوتين:",
    "step1": "في إعدادات Safari ← الامتدادات، فعّل X Dim Mode.",
    "step2": "على x.com، انقر على أيقونة X Dim Mode في شريط الأدوات واسمح لها دائمًا على هذا الموقع.",
    "hintOn": "لا ترى تغييرًا؟ على x.com، انقر على أيقونة X Dim Mode في شريط الأدوات واسمح لها دائمًا على هذا الموقع.",
    "button": "فتح إعدادات Safari",
    "tagline": "يعيد خلفية Dim الزرقاء الداكنة التي أزالها X، مع شعار طائر تويتر والخط الكلاسيكي وشبكة الصور القديمة."
  }
};

function pick(lang) {
  const tag = (lang || "en").replace("-", "_");
  if (STRINGS[tag]) return tag;
  if (tag.startsWith("pt")) return "pt_BR";
  if (tag.startsWith("zh")) return "zh_CN";
  const base = tag.split("_")[0];
  return STRINGS[base] ? base : "en";
}

function show(enabled, lang) {
  const loc = pick(lang);
  const t = STRINGS[loc];
  document.documentElement.lang = loc.replace("_", "-");
  document.documentElement.dir = loc === "ar" ? "rtl" : "ltr";
  for (const el of document.querySelectorAll("[data-t]")) el.textContent = t[el.dataset.t];
  document.body.classList.toggle("state-on", enabled === true);
  document.body.classList.toggle("state-off", enabled !== true);
  document.body.classList.add("ready");
}

document.querySelector("button").addEventListener("click", () => {
  webkit.messageHandlers.controller.postMessage("open-preferences");
});
