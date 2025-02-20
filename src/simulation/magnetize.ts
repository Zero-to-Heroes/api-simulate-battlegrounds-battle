import { CardIds, GameTag } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

export const magnetizeToTarget = (
	target: BoardEntity,
	cardIdToMagnetize: string,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const electromagneticDevices = hero.trinkets.filter(
		(t) => t.cardId === CardIds.ElectromagneticDevice_BG30_MagicItem_709,
	).length;
	const modularCard = gameState.allCards.getCard(cardIdToMagnetize);
	modifyStats(
		target,
		modularCard.attack + 2 * electromagneticDevices,
		modularCard.health + 2 * electromagneticDevices,
		board,
		hero,
		gameState,
	);
	target.taunt = target.taunt || modularCard.mechanics?.includes(GameTag[GameTag.TAUNT]);
	target.divineShield = target.divineShield || modularCard.mechanics?.includes(GameTag[GameTag.DIVINE_SHIELD]);
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
	if ([CardIds.DrBoomsMonster_BG31_176, CardIds.DrBoomsMonster_BG31_176_G].includes(cardIdToMagnetize as CardIds)) {
		const mult = cardIdToMagnetize === CardIds.DrBoomsMonster_BG31_176 ? 1 : 2;
		target.attack += 2 * hero.globalInfo.MagnetizedThisGame * mult;
		target.health += 2 * hero.globalInfo.MagnetizedThisGame * mult;
	}

	// Dr Boom's Monster?
	hero.globalInfo.MagnetizedThisGame = hero.globalInfo.MagnetizedThisGame + 1;
	for (const entity of board) {
		const drBoomBases =
			(entity.cardId === CardIds.DrBoomsMonster_BG31_176 ? 1 : 0) +
			entity.enchantments.filter((e) => e.cardId === CardIds.DrBoomsMonster_DrBoomsMonsterEnchantment_BG31_176e)
				.length;
		const drBoomGoldens =
			(entity.cardId === CardIds.DrBoomsMonster_BG31_176_G ? 1 : 0) +
			entity.enchantments.filter((e) => e.cardId === CardIds.DrBoomsMonster_DrBoomsMonsterEnchantment_BG31_176_Ge)
				.length;
		entity.attack += drBoomBases * 2 + drBoomGoldens * 4;
		entity.health += drBoomBases * 2 + drBoomGoldens * 4;
	}
};
