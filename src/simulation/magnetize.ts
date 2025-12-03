import { GameTag, ReferenceCard } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnAfterMagnetize, hasOnBeforeMagnetize, hasOnBeforeMagnetizeSelf } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { CardIds } from '../services/card-ids';
import { Mutable } from '../services/utils';
import { buildSingleBoardEntity } from '../utils';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

export const magnetizeToTarget = (
	inputTargets: BoardEntity[] | (() => BoardEntity[]),
	source: BoardEntity,
	cardsToMagnetize: string[] | ReferenceCard[],
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const electromagneticDevices = hero.trinkets.filter(
		(t) => t.cardId === CardIds.ElectromagneticDevice_BG30_MagicItem_709,
	).length;
	const greaterElecromagneticDevices = hero.trinkets.filter(
		(t) => t.cardId === CardIds.ElectromagneticDevice_ElectromagneticDeviceToken_BG30_MagicItem_709t,
	).length;

	const magnetMult = board.some((e) => e.cardId === CardIds.DoubleDemolisher_BG34_177_G)
		? 3
		: board.some((e) => e.cardId === CardIds.DoubleDemolisher_BG34_177)
		? 2
		: 1;
	for (let i = 0; i < magnetMult; i++) {
		const actualTargets = typeof inputTargets === 'function' ? inputTargets() : inputTargets;
		for (const target of actualTargets) {
			for (const cardToMagnetize of cardsToMagnetize) {
				const modularCard =
					typeof cardToMagnetize === 'string'
						? { ...gameState.allCards.getCard(cardToMagnetize) }
						: cardToMagnetize;
				const modularBoardEntity = buildSingleBoardEntity(
					modularCard.id,
					hero,
					board,
					gameState.allCards,
					hero.friendly,
					gameState.sharedState.currentEntityId++,
					false,
					gameState.cardsData,
					gameState.sharedState,
					null,
					null,
					{
						referenceCardToUse: modularCard,
					},
				);
				const onBeforeMagnetizeSelfImpl = cardMappings[modularBoardEntity.cardId];
				if (hasOnBeforeMagnetizeSelf(onBeforeMagnetizeSelfImpl)) {
					onBeforeMagnetizeSelfImpl.onBeforeMagnetizeSelf(modularBoardEntity, {
						board: board,
						hero: hero,
						magnetizeTarget: target,
						gameState: gameState,
					});
				}

				for (const boardEntity of board) {
					const onBeforeMagnetizeImpl = cardMappings[boardEntity.cardId];
					if (hasOnBeforeMagnetize(onBeforeMagnetizeImpl)) {
						onBeforeMagnetizeImpl.onBeforeMagnetize(boardEntity, {
							board: board,
							hero: hero,
							magnetizedCard: modularCard,
							magnetizeTarget: target,
							gameState: gameState,
						});
					}
				}

				modifyStats(
					target,
					source,
					modularBoardEntity.attack + 2 * electromagneticDevices + 4 * greaterElecromagneticDevices,
					modularBoardEntity.health + 2 * electromagneticDevices + 4 * greaterElecromagneticDevices,
					board,
					hero,
					gameState,
				);
				target.taunt = target.taunt || modularCard.mechanics?.includes(GameTag[GameTag.TAUNT]);
				target.divineShield =
					target.divineShield || modularCard.mechanics?.includes(GameTag[GameTag.DIVINE_SHIELD]);
				target.poisonous = target.poisonous || modularCard.mechanics?.includes(GameTag[GameTag.POISONOUS]);
				target.venomous = target.venomous || modularCard.mechanics?.includes(GameTag[GameTag.VENOMOUS]);
				target.windfury = target.windfury || modularCard.mechanics?.includes(GameTag[GameTag.WINDFURY]);
				target.reborn = target.reborn || modularCard.mechanics?.includes(GameTag[GameTag.REBORN]);
				target.stealth = target.stealth || modularCard.mechanics?.includes(GameTag[GameTag.STEALTH]);

				const magneticEnchantment = modularCard.enchantmentDbfId;
				if (magneticEnchantment) {
					const enchantment = gameState.allCards.getCard(magneticEnchantment).id;
					target.enchantments.push({
						cardId: enchantment,
						originEntityId: modularCard.dbfId,
						timing: gameState.sharedState.currentEntityId++,
					});
				}
				if (
					[CardIds.DrBoomsMonster_BG31_176, CardIds.DrBoomsMonster_BG31_176_G].includes(
						cardToMagnetize as CardIds,
					)
				) {
					const mult = cardToMagnetize === CardIds.DrBoomsMonster_BG31_176 ? 1 : 2;
					target.attack += 2 * hero.globalInfo.MagnetizedThisGame * mult;
					target.health += 2 * hero.globalInfo.MagnetizedThisGame * mult;
				}

				// Dr Boom's Monster?
				hero.globalInfo.MagnetizedThisGame = hero.globalInfo.MagnetizedThisGame + 1;
				for (const entity of board) {
					const drBoomBases =
						(entity.cardId === CardIds.DrBoomsMonster_BG31_176 ? 1 : 0) +
						entity.enchantments.filter(
							(e) => e.cardId === CardIds.DrBoomsMonster_DrBoomsMonsterEnchantment_BG31_176e,
						).length;
					const drBoomGoldens =
						(entity.cardId === CardIds.DrBoomsMonster_BG31_176_G ? 1 : 0) +
						entity.enchantments.filter(
							(e) => e.cardId === CardIds.DrBoomsMonster_DrBoomsMonsterEnchantment_BG31_176_Ge,
						).length;
					entity.attack += drBoomBases * 2 + drBoomGoldens * 4;
					entity.health += drBoomBases * 2 + drBoomGoldens * 4;
				}

				const onAfterMagnetizeImpl = cardMappings[modularCard.id];
				if (hasOnAfterMagnetize(onAfterMagnetizeImpl)) {
					onAfterMagnetizeImpl.onAfterMagnetize(target, {
						board: board,
						hero: hero,
						otherHero: otherHero,
						otherBoard: otherBoard,
						magnetizedCard: modularCard,
						magnetizeTarget: target,
						gameState: gameState,
					});
				}
			}
		}
	}
};

export interface OnBeforeMagnetizeInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	magnetizedCard: Mutable<ReferenceCard>;
	magnetizeTarget: BoardEntity;
	gameState: FullGameState;
}

export interface OnBeforeMagnetizeSelfInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	magnetizeTarget: BoardEntity;
	gameState: FullGameState;
}

export interface OnAfterMagnetizeInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	otherHero: BgsPlayerEntity;
	otherBoard: BoardEntity[];
	magnetizedCard: ReferenceCard;
	magnetizeTarget: BoardEntity;
	gameState: FullGameState;
}
