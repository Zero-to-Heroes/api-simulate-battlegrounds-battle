import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { grantRandomDivineShield } from '../../../keywords/divine-shield';
import { BattlecryInput } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const SelflessHero: BattlecryCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.SelflessHero_BG_OG_221, CardIds.SelflessHero_TB_BaconUps_014],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		if (!input.hero.trinkets?.some((t) => t.cardId === CardIds.SelflessPortrait_BG32_MagicItem_804)) {
			return false;
		}
		const mult = minion.cardId === CardIds.SelflessHero_TB_BaconUps_014 ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			grantRandomDivineShield(minion, input.board, input.hero, input.otherHero, input.gameState);
		}
		return true;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.SelflessHero_TB_BaconUps_014 ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			grantRandomDivineShield(
				minion,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.otherBoardHero,
				input.gameState,
			);
		}
		return [];
	},
};
