import { CardIds } from '../../services/card-ids';
import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { FullGameState } from '../internal-game-state';
import { handleSummonsWhenSpace } from '../summon-when-space';
import { performStartOfCombatAction } from './soc-action-processor';
import { SoCInput } from './start-of-combat-input';

export const handleStartOfCombatHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	// Apparently it's a toin coss about whether to handle Illidan first or Al'Akir first
	// Auras are only relevant for Illidan, and already applied there
	if (Math.random() < 0.5) {
		currentAttacker = handlePlayerStartOfCombatHeroPowers({
			playerEntity: playerEntity,
			playerBoard: playerBoard,
			opponentEntity: opponentEntity,
			opponentBoard: opponentBoard,
			currentAttacker,
			playerIsFriendly: true,
			gameState,
		});
		currentAttacker = handlePlayerStartOfCombatHeroPowers({
			playerEntity: opponentEntity,
			playerBoard: opponentBoard,
			opponentEntity: playerEntity,
			opponentBoard: playerBoard,
			currentAttacker,
			playerIsFriendly: false,
			gameState,
		});
	} else {
		currentAttacker = handlePlayerStartOfCombatHeroPowers({
			playerEntity: opponentEntity,
			playerBoard: opponentBoard,
			opponentEntity: playerEntity,
			opponentBoard: playerBoard,
			currentAttacker,
			playerIsFriendly: false,
			gameState,
		});
		currentAttacker = handlePlayerStartOfCombatHeroPowers({
			playerEntity: playerEntity,
			playerBoard: playerBoard,
			opponentEntity: opponentEntity,
			opponentBoard: opponentBoard,
			currentAttacker,
			playerIsFriendly: true,
			gameState,
		});
	}
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handlePlayerStartOfCombatHeroPowers = (input: SoCInput): number => {
	const loops = input.playerEntity.trinkets?.some((t) => t.cardId === CardIds.ValdrakkenWindChimes_BG32_MagicItem_365)
		? 2
		: 1;
	for (let i = 0; i < loops; i++) {
		if (input.playerEntity.startOfCombatDone || input.playerEntity.hpLeft <= 0) {
			return input.currentAttacker;
		}

		for (const heroPower of input.playerEntity.heroPowers) {
			performStartOfCombatAction(heroPower.cardId, input.playerEntity, input, true, 'start-of-combat');
		}
	}
	return input.currentAttacker;
};

// export const getHeroPowerForHero = (heroCardId: string): string => {
// 	switch (heroCardId) {
// 		case CardIds.IllidanStormrage_TB_BaconShop_HERO_08:
// 			return CardIds.Wingmen;
// 		case CardIds.TheLichKing_TB_BaconShop_HERO_22:
// 			return CardIds.RebornRites;
// 		case CardIds.ProfessorPutricide_BG25_HERO_100:
// 			return CardIds.RagePotion;
// 		case CardIds.Deathwing_TB_BaconShop_HERO_52:
// 			return CardIds.AllWillBurn;
// 		case CardIds.TeronGorefiend_BG25_HERO_103:
// 			return CardIds.TeronGorefiend_RapidReanimation;
// 	}
// 	return null;
// };
