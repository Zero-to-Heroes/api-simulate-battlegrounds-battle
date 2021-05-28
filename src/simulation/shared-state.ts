import { BoardEntity } from '../board-entity';

export class SharedState {
	public static debugEnabled = false;

	public currentEntityId = 1;
	public deaths: BoardEntity[] = [];
	public debug = false;

	constructor() {
		this.debug = SharedState.debugEnabled;
	}
}
