import { useId, useMemo, useState } from "react";
import {
  getEditorialServicesForGame,
  getServiceEditorialText,
  normalizeServiceLocale,
  serviceEditorialCopy,
  serviceEditorialGames,
} from "../data/serviceCatalog";
import "../styles/services-editorial.css";

const DEFAULT_GAME_ID = serviceEditorialGames[0].id;

function ServiceCard({ service, game, locale, labels, onSelect }) {
  const gameName = getServiceEditorialText(game.name, locale);
  const serviceTitle = getServiceEditorialText(service.title, locale);
  const description = getServiceEditorialText(service.description, locale).replace(
    "{game}",
    gameName,
  );

  return (
    <article className="aurora-services__card" data-service-id={service.id}>
      <span className="aurora-services__category">
        {getServiceEditorialText(service.category, locale)}
      </span>
      <h3>{serviceTitle}</h3>
      <p>{description}</p>
      <button
        type="button"
        className="aurora-services__quote-button"
        onClick={() => onSelect?.({ service, game, locale })}
        aria-label={`${labels.requestQuote}：${gameName}－${serviceTitle}`}
      >
        <span>{labels.requestQuote}</span>
        <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}

/**
 * Drop-in replacement for the existing #services section.
 *
 * Props:
 * - locale: "zh-HK" | "en" | "zh-CN"
 * - activeGameId: optional controlled game id
 * - initialGameId: starting id when uncontrolled
 * - onGameChange(gameId): notified after a tab change
 * - onServiceSelect({ service, game, locale }): called by every quote button
 * - id/className: integration hooks for the page shell
 */
export default function ServicesEditorial({
  locale = "zh-HK",
  activeGameId: controlledGameId,
  initialGameId = DEFAULT_GAME_ID,
  onGameChange,
  onServiceSelect,
  id = "services",
  className = "",
}) {
  const normalizedLocale = normalizeServiceLocale(locale);
  const labels = serviceEditorialCopy[normalizedLocale];
  const fallbackGameId = serviceEditorialGames.some((game) => game.id === initialGameId)
    ? initialGameId
    : DEFAULT_GAME_ID;
  const [internalGameId, setInternalGameId] = useState(fallbackGameId);
  const requestedGameId = controlledGameId ?? internalGameId;
  const activeGameId = serviceEditorialGames.some((game) => game.id === requestedGameId)
    ? requestedGameId
    : DEFAULT_GAME_ID;
  const activeGame = serviceEditorialGames.find((game) => game.id === activeGameId);
  const visibleServices = useMemo(
    () => getEditorialServicesForGame(activeGameId),
    [activeGameId],
  );
  const instanceId = useId().replace(/:/g, "");

  const selectGame = (gameId) => {
    if (controlledGameId === undefined) setInternalGameId(gameId);
    onGameChange?.(gameId);
  };

  const handleTabKeyDown = (event, index) => {
    const lastIndex = serviceEditorialGames.length - 1;
    let nextIndex = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    const nextGame = serviceEditorialGames[nextIndex];
    selectGame(nextGame.id);
    event.currentTarget.parentElement
      ?.querySelector(`[data-game-id="${nextGame.id}"]`)
      ?.focus();
  };

  return (
    <section id={id} className={`aurora-services ${className}`.trim()}>
      <div className="aurora-services__shell">
        <header className="aurora-services__intro">
          <span className="aurora-services__eyebrow">{labels.eyebrow}</span>
          <h2>{labels.title}</h2>
          <p>{labels.description}</p>
        </header>

        <div
          className="aurora-services__tabs"
          role="tablist"
          aria-label={labels.tabsLabel}
        >
          {serviceEditorialGames.map((game, index) => {
            const isActive = game.id === activeGameId;
            const tabId = `${instanceId}-${game.id}-tab`;
            return (
              <button
                key={game.id}
                id={tabId}
                type="button"
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={`${instanceId}-service-panel`}
                className={isActive ? "is-active" : ""}
                data-game-id={game.id}
                onClick={() => selectGame(game.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {getServiceEditorialText(game.name, normalizedLocale)}
              </button>
            );
          })}
        </div>

        <div
          id={`${instanceId}-service-panel`}
          className="aurora-services__grid"
          role="tabpanel"
          aria-labelledby={`${instanceId}-${activeGameId}-tab`}
          aria-describedby={`${instanceId}-quote-note`}
          aria-label={labels.gridLabel}
        >
          {visibleServices.map((service) => (
            <ServiceCard
              key={`${activeGameId}-${service.id}`}
              service={service}
              game={activeGame}
              locale={normalizedLocale}
              labels={labels}
              onSelect={onServiceSelect}
            />
          ))}
        </div>

        <p id={`${instanceId}-quote-note`} className="aurora-services__quote-note">
          {labels.quoteNote}
        </p>
      </div>
    </section>
  );
}
