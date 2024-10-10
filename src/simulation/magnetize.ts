import { GameTag } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { TempCardIds } from '../temp-card-ids';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

export const magnetizeToTarget = (
	target: BoardEntity,
	cardIdToMagnetize: string,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const electromagneticDevices = hero.trinkets.filter((t) => t.cardId === TempCardIds.ElectromagneticDevice).length;
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
};
