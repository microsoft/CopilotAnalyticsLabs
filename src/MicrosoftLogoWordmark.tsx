/** Microsoft logo and wordmark, shared by the site header and footer. */
export function MicrosoftLogoWordmark() {
  return (
    <span className="labs-wordmark">
      <img src={`${import.meta.env.BASE_URL}images/microsoft-logo.svg`} alt="" width="16" height="16" />
      <span>Microsoft</span>
    </span>
  );
}
