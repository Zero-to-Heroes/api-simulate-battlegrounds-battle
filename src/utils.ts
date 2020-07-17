/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from './board-entity';

const CLEAVE_IDS = [
	'LOOT_078', // Cave Hydra
	'GVG_113', // Foe Reaper 4000
];
const ATTACK_IMMEDIATELY_IDS = [
	CardIds.NonCollectible.Rogue.Scallywag_SkyPirateToken,
	CardIds.NonCollectible.Rogue.Scallywag_SkyPirateTokenTavernBrawl,
];
const MEGA_WINDFURY_IDS = [CardIds.NonCollectible.Neutral.ZappSlywickTavernBrawl];
const CANT_ATTACK_IDS = [
	CardIds.NonCollectible.Neutral.ArcaneCannon,
	CardIds.NonCollectible.Neutral.ArcaneCannonTavernBrawl,
];

export const buildSingleBoardEntity = (
	cardId: string,
	allCards: AllCardsService,
	friendly: boolean,
	entityId = 1,
): BoardEntity => {
	const card = allCards.getCard(cardId);
	const megaWindfury = MEGA_WINDFURY_IDS.indexOf(cardId) !== -1;
	const attackImmediately = ATTACK_IMMEDIATELY_IDS.indexOf(cardId) !== -1;
	return addImpliedMechanics({
		attack: card.attack,
		attacksPerformed: 0,
		cardId: cardId,
		divineShield: card.mechanics && card.mechanics.indexOf('DIVINE_SHIELD') !== -1,
		entityId: entityId,
		health: card.health,
		taunt: card.mechanics && card.mechanics.indexOf('TAUNT') !== -1,
		reborn: card.mechanics && card.mechanics.indexOf('REBORN') !== -1,
		poisonous: card.mechanics && card.mechanics.indexOf('POISONOUS') !== -1,
		windfury: !megaWindfury && card.mechanics && card.mechanics.indexOf('WINDFURY') !== -1,
		megaWindfury: megaWindfury,
		enchantments: [],
		friendly: friendly,
		attackImmediately: attackImmediately,
	} as BoardEntity);
};

export const addImpliedMechanics = (entity: BoardEntity): BoardEntity => {
	return {
		...entity,
		cleave: CLEAVE_IDS.indexOf(entity.cardId) !== -1,
		cantAttack: CANT_ATTACK_IDS.indexOf(entity.cardId) !== -1,
	} as BoardEntity;
};

export const stringifySimple = (board: readonly BoardEntity[]): string => {
	return '[' + board.map(entity => stringifySimpleCard(entity)).join(', ') + ']';
};

export const stringifySimpleCard = (entity: BoardEntity): string => {
	return entity
		? `${entity.cardId}/${entity.attack}/${entity.health}/${entity.entityId}/${
				entity.divineShield
		  }/${entity.attacksPerformed || 0}`
		: null;
};

export const toBase64 = (input: string): string => {
	const buff = Buffer.from(input, 'utf-8');
	const base64 = buff.toString('base64');
	return base64;
};

export const fromBase64 = (base64: string): string => {
	const buff = Buffer.from(base64, 'base64');
	const str = buff.toString('utf-8');
	return str;
};
