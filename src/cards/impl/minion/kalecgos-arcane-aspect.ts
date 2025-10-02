import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnBattlecryTriggeredInput } from '../../../simulation/battlecries';
import { addStatsToBoard } from '../../../utils';
import { OnBattlecryTriggeredCard } from '../../card.interface';

export const KalecgosArcaneAspect: OnBattlecryTriggeredCard = {
	cardIds: [CardIds.KalecgosArcaneAspect_BGS_041, CardIds.KalecgosArcaneAspect_TB_BaconUps_109],
	onBattlecryTriggered: (minion: BoardEntity, input: OnBattlecryTriggeredInput) => {
		const buff = minion.cardId === CardIds.KalecgosArcaneAspect_BGS_041 ? 1 : 2;
		addStatsToBoard(minion, input.board, input.hero, 1 * buff, 1 * buff, input.gameState, Race[Race.DRAGON]);
	},
};
