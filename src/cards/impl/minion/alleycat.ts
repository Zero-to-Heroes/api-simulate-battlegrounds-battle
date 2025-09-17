import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntitiesWithAddToBoard } from '../../../simulation/deathrattle-spawns';
import { BattlecryCard } from '../../card.interface';

export const Alleycat: BattlecryCard = {
	cardIds: [CardIds.Alleycat_BG_CFM_315, CardIds.Alleycat_TB_BaconUps_093],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const spawnInput: DeathrattleTriggeredInput = {
			boardWithDeadEntity: input.board,
			boardWithDeadEntityHero: input.hero,
			gameState: input.gameState,
			deadEntity: minion, // weird
			otherBoard: input.otherBoard,
			otherBoardHero: input.otherHero,
		};
		const cardId =
			minion.cardId === CardIds.Alleycat_BG_CFM_315
				? CardIds.Alleycat_TabbycatToken_BG_CFM_315t
				: CardIds.Alleycat_TabbycatToken_TB_BaconUps_093t;
		const indexFromRight = input.board.length - input.board.indexOf(minion) - 1;
		simplifiedSpawnEntitiesWithAddToBoard(cardId, 1, spawnInput, minion, indexFromRight);
		return true;
	},
};
