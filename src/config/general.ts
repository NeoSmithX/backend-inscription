type ConfigRelay = {
    ai:{
        url:string,
        port:number
    },
    frontend:{
        url:string,
        port:number
    }

}

export const configRelay:ConfigRelay = {
    'ai':{
        url:'http://127.0.0.1',
        port:1984,
    },
    'frontend':{
        url:'http://127.0.0.1',
        port:1985,
    }
}