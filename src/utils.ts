/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { ReferenceCard } from '@firestone-hs/reference-data/lib/models/reference-cards/reference-card';
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
		divineShield: hasMechanic(card, 'DIVINE_SHIELD'),
		entityId: entityId,
		health: card.health,
		taunt: hasMechanic(card, 'TAUNT'),
		reborn: hasMechanic(card, 'REBORN'),
		poisonous: hasMechanic(card, 'POISONOUS'),
		windfury: !megaWindfury && hasMechanic(card, 'WINDFURY'),
		megaWindfury: megaWindfury,
		enchantments: [],
		friendly: friendly,
		attackImmediately: attackImmediately,
	} as BoardEntity);
};

const hasMechanic = (card: ReferenceCard, mechanic: string): boolean => {
	return card.mechanics?.includes(mechanic) || card.referencedTags?.includes(mechanic);
}

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

export const encode = (input: string): string => {
	// return compressToEncodedURIComponent(input);
	const buff = Buffer.from(input, 'utf-8');
	const base64 = buff.toString('base64');
	return base64;
};

export const decode = (base64: string): string => {
	const buff = Buffer.from(base64, 'base64');
	const str = buff.toString('utf-8');
	return str;
};
