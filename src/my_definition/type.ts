

export type ResToFrontend = {
    status: boolean,
    log: string,
    data: any
}

export type QuestData = {
    network:string,
    space:string,
    question_ID: number,
    question: string,
    deploy_hash?: string,
    correct_answer?: string,
    winner_num?: number,
    winner_list?: string[]
}