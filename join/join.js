/* Reads the invitation code from the address (?code=<code>, the same link the app opens directly when it is installed; an older #<code> link still works), and
   opens the LI Games app with ligames://join/<code> when the visitor taps the button. The script itself sends nothing anywhere and stores nothing. The text of
   the page is only ever set with textContent / setAttribute, never as HTML. */
(function () {
  var root = document.documentElement;
  // exactly one "code" parameter (two are ambiguous), as in apps/mobile/src/lib/inviteLink.ts
  function queryCode(search) {
    var found = [];
    var parts = String(search || '').replace(/^\?/, '').split('&');
    for (var p = 0; p < parts.length; p++) {
      var eq = parts[p].indexOf('=');
      var key = eq < 0 ? parts[p] : parts[p].slice(0, eq);
      if (key === 'code') found.push(eq < 0 ? '' : parts[p].slice(eq + 1));
    }
    return found.length === 1 ? found[0] : '';
  }
  var raw = queryCode(window.location.search) || (window.location.hash || '').replace(/^#/, '');
  var code = '';
  try { code = decodeURIComponent(raw).trim(); } catch (e) { code = ''; }
  // the same shape the app accepts (apps/mobile/src/lib/inviteLink.ts)
  var valid = /^[A-Za-z0-9]{6,32}$/.test(code);
  root.className = (root.className ? root.className + ' ' : '') + (valid ? 'has-code' : 'no-code');
  if (!valid) return;

  // the app's own scheme: the page says which (the development page uses ligamesdev); the only two schemes that exist are accepted, anything else is ligames
  var scheme = root.getAttribute('data-app-scheme');
  if (scheme !== 'ligamesdev') scheme = 'ligames';
  var link = scheme + '://join/' + code;
  var targets = document.querySelectorAll('[data-open-app]');
  for (var i = 0; i < targets.length; i++) targets[i].setAttribute('href', link);
  var codes = document.querySelectorAll('[data-invite-code]');
  for (var j = 0; j < codes.length; j++) codes[j].textContent = code;

  var buttons = document.querySelectorAll('[data-copy-code]');
  for (var k = 0; k < buttons.length; k++) {
    buttons[k].addEventListener('click', function (event) {
      var button = event.currentTarget;
      var done = button.getAttribute('data-done') || 'Copied';
      var original = button.textContent;
      var finish = function () { button.textContent = done; window.setTimeout(function () { button.textContent = original; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(finish, function () {});
      }
    });
  }
})();
