/* pages/closeout.js — embeds the locally served Daily Closeout workspace */

const CloseoutPage = {
  render() {
    const user = Auth.getUser();
    const account = user?.id || user?.email;
    const src = `/closeout/${account ? `?account=${encodeURIComponent(account)}` : ''}`;

    setPageContent(`
      <iframe
        class="closeout-frame"
        src="${src}"
        title="Daily closeout and shift notes"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    `);
  },
};
