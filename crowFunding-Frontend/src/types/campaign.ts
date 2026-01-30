export type Campaign = {
  address: string;
  creator: string;
  goal: string;
  deadlineTimestamp: number;
  totalRaisedWei: string;
  status: 'Funding' | 'Successful' | 'Failed' | 'Withdrawn';
  rewardRate: number;
}

export type CampaignDTO =  {
    creator : `0x${string}`;
    goal : bigint ;
    deadline : bigint;
    totalRaised : bigint ;
    state : number;
    withdrawn : boolean;
    rewardPerEth : bigint;

}

// type conversion functions
export function DtoTOCampaign(dto: CampaignDTO, address: string) : Campaign {
    const statusMap = ['Funding', 'Successful', 'Failed', 'Withdrawn'] as const;
    return {
        address,
        creator: dto.creator,
        goal: dto.goal.toString(),
        deadlineTimestamp: Number(dto.deadline),
        totalRaisedWei: dto.totalRaised.toString(),
        status: dto.withdrawn ? 'Withdrawn' : statusMap[dto.state],
        rewardRate: Number(dto.rewardPerEth)
    };
}