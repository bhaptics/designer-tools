export enum FeedbackType {
  Vest= 'Vest',
  Arm = 'Arm',
  Foot = 'Foot',
  Hand = 'Hand',
  Head = 'Head',
  Unknown = 'Unknown'
}

export interface TactFile {
  fileName: string;
  type: FeedbackType;
  content: string;
}
