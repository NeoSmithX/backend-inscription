// import {mysql.ConnectionOptions} from 'mysql2/promise';

type NetworkConfig = {
    url:string,
    port:number,
}

export const network_config:NetworkConfig = {
    url:'http://127.0.0.1',
    port:1986,
}
// type SubscanApiUrl = {}

export const subscan_api_url ={
    'polkadot':'polkadot.api.subscan.io',
    'astar':'astar.api.subscan.io'
}

export const database_config = {
    host: 'localhost',
    user: 'aiwbe3_test',
    password: '',
    database: 'inscription_aiweb3'
  }