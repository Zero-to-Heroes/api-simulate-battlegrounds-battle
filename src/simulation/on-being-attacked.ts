import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { updateDivineShield } from '../utils';
import { getNeighbours } from './attack';
import { FullGameState } from './internal-game-state';
import { handlePackTactics, handleSnakeTrap, handleSplittingImage, handleVenomstrikeTrap } from './secrets';
import { modifyAttack, modifyHealth, setEntityStats } from './stats';

export const applyOnBeingAttackedBuffs = (
	attackerEntity: BoardEntity,
	attackerBoard: BoardEntity[],
	attackerHero: BgsPlayerEntity,
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingPlayerEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// We need to respect the order of the secrets
	for (const secret of (defendingPlayerEntity.secrets ?? []).filter((s) => !s.triggered)) {
		switch (secret.cardId) {
			case CardIds.AutodefenseMatrix_TB_Bacon_Secrets_07:
				if (!defendingEntity.divineShield) {
					secret.triggered = true;
					updateDivineShield(defendingEntity, defendingBoard, true, gameState.allCards);
				}
				break;
			case CardIds.SplittingImage_TB_Bacon_Secrets_04:
				if (defendingBoard.length < 7) {
					secret.triggered = true;
					handleSplittingImage(
						defendingEntity,
						defendingBoard,
						defendingPlayerEntity,
						attackerBoard,
						attackerHero,
						gameState,
					);
				}
				break;
			case CardIds.PackTactics_TB_Bacon_Secrets_15:
				if (defendingBoard.length < 7) {
					secret.triggered = true;
					handlePackTactics(
						defendingEntity,
						defendingBoard,
						defendingPlayerEntity,
						attackerBoard,
						attackerHero,
						gameState,
					);
				}
				break;
			case CardIds.SnakeTrap_TB_Bacon_Secrets_02:
				if (defendingBoard.length < 7) {
					secret.triggered = true;
					handleSnakeTrap(
						defendingEntity,
						defendingBoard,
						defendingPlayerEntity,
						attackerBoard,
						attackerHero,
						gameState,
					);
				}
				break;
			case CardIds.VenomstrikeTrap_TB_Bacon_Secrets_01:
				if (defendingBoard.length < 7) {
					secret.triggered = true;
					handleVenomstrikeTrap(
						defendingEntity,
						defendingBoard,
						defendingPlayerEntity,
						attackerBoard,
						attackerHero,
						gameState,
					);
				}
				break;
		}
	}

	if (defendingEntity.taunt) {
		const champions = defendingBoard.filter((entity) => entity.cardId === CardIds.ChampionOfYshaarj_BGS_111);
		const goldenChampions = defendingBoard.filter(
			(entity) => entity.cardId === CardIds.ChampionOfYshaarj_TB_BaconUps_301,
		);
		champions.forEach((entity) => {
			modifyAttack(entity, 1, defendingBoard, defendingPlayerEntity, gameState);
			modifyHealth(entity, 2, defendingBoard, defendingPlayerEntity, gameState);
			gameState.spectator.registerPowerTarget(
				entity,
				entity,
				defendingBoard,
				attackerHero,
				defendingPlayerEntity,
			);
		});
		goldenChampions.forEach((entity) => {
			modifyAttack(entity, 2, defendingBoard, defendingPlayerEntity, gameState);
			modifyHealth(entity, 4, defendingBoard, defendingPlayerEntity, gameState);
			gameState.spectator.registerPowerTarget(
				entity,
				entity,
				defendingBoard,
				attackerHero,
				defendingPlayerEntity,
			);
		});

		const arms = defendingBoard.filter((entity) => entity.cardId === CardIds.ArmOfTheEmpire_BGS_110);
		const goldenArms = defendingBoard.filter((entity) => entity.cardId === CardIds.ArmOfTheEmpire_TB_BaconUps_302);
		arms.forEach((arm) => {
			modifyAttack(defendingEntity, 2, defendingBoard, defendingPlayerEntity, gameState);
			gameState.spectator.registerPowerTarget(
				arm,
				defendingEntity,
				defendingBoard,
				attackerHero,
				defendingPlayerEntity,
			);
		});
		goldenArms.forEach((arm) => {
			modifyAttack(defendingEntity, 4, defendingBoard, defendingPlayerEntity, gameState);
			gameState.spectator.registerPowerTarget(
				arm,
				defendingEntity,
				defendingBoard,
				attackerHero,
				defendingPlayerEntity,
			);
		});
	}

	// Based on defending entity
	if (defendingEntity.cardId === CardIds.TormentedRitualist_BGS_201) {
		const neighbours = getNeighbours(defendingBoard, defendingEntity);
		neighbours.forEach((entity) => {
			modifyAttack(entity, 1, defendingBoard, defendingPlayerEntity, gameState);
			modifyHealth(entity, 1, defendingBoard, defendingPlayerEntity, gameState);
			gameState.spectator.registerPowerTarget(
				defendingEntity,
				entity,
				defendingBoard,
				attackerHero,
				defendingPlayerEntity,
			);
		});
	} else if (defendingEntity.cardId === CardIds.TormentedRitualist_TB_BaconUps_257) {
		const neighbours = getNeighbours(defendingBoard, defendingEntity);
		neighbours.forEach((entity) => {
			modifyAttack(entity, 2, defendingBoard, defendingPlayerEntity, gameState);
			modifyHealth(entity, 2, defendingBoard, defendingPlayerEntity, gameState);
			gameState.spectator.registerPowerTarget(
				defendingEntity,
				entity,
				defendingBoard,
				attackerHero,
				defendingPlayerEntity,
			);
		});
	} else if (
		defendingEntity.cardId === CardIds.DozyWhelp_BG24_300 ||
		defendingEntity.cardId === CardIds.DozyWhelp_BG24_300_G
	) {
		modifyAttack(
			defendingEntity,
			defendingEntity.cardId === CardIds.DozyWhelp_BG24_300_G ? 2 : 1,
			defendingBoard,
			defendingPlayerEntity,
			gameState,
		);
		gameState.spectator.registerPowerTarget(
			defendingEntity,
			defendingEntity,
			defendingBoard,
			attackerHero,
			defendingPlayerEntity,
		);
	} else if (
		[CardIds.AdaptableBarricade_BG27_022, CardIds.AdaptableBarricade_BG27_022_G].includes(
			defendingEntity.cardId as CardIds,
		)
	) {
		// https://twitter.com/LoewenMitchell/status/1692225556559901031?s=20
		const totalStats = defendingEntity.attack + defendingEntity.health;
		const attackerAttack = attackerEntity.attack;
		if (defendingEntity.divineShield) {
			defendingEntity.health = 1;
			defendingEntity.attack = totalStats - defendingEntity.health;
		} else if (attackerEntity.venomous || attackerEntity.poisonous) {
			// Do nothing
		} else if (attackerAttack < totalStats) {
			defendingEntity.health = attackerAttack + 1;
			defendingEntity.attack = totalStats - defendingEntity.health;
		}
	} else if (
		[CardIds.GraniteGuardian_BG24_001, CardIds.GraniteGuardian_BG24_001_G].includes(
			defendingEntity.cardId as CardIds,
		)
	) {
		attackerEntity.health = 1;
	} else if (
		[CardIds.WaywardGrimscale_BG28_406, CardIds.WaywardGrimscale_BG28_406_G].includes(
			defendingEntity.cardId as CardIds,
		)
	) {
		defendingEntity.venomous = true;
	}

	// Based on attacking entity
	if (
		attackerEntity.cardId === CardIds.SindoreiStraightShot_BG25_016 ||
		attackerEntity.cardId === CardIds.SindoreiStraightShot_BG25_016_G
	) {
		defendingEntity.taunt = false;
		defendingEntity.reborn = false;
	} else if (
		[CardIds.TransmutedBramblewitch_BG27_013, CardIds.TransmutedBramblewitch_BG27_013_G].includes(
			attackerEntity.cardId as CardIds,
		) &&
		attackerEntity.abiityChargesLeft > 0
	) {
		// TODO: also modify all code that directly sets the stats of an entity
		setEntityStats(defendingEntity, 3, 3, defendingBoard, defendingPlayerEntity, gameState);
		attackerEntity.abiityChargesLeft--;
	}
};
