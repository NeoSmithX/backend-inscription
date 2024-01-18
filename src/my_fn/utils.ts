import { Keyring } from "@polkadot/api";
import { u8aToHex } from '@polkadot/util';
const keyring = new Keyring({ type: 'sr25519' })

export const polkadot_key_format = (from:any, to:any) => {
    let public_key

    if (!from || from === null || from === undefined || from === ''){
  
        public_key =  new Uint8Array(32)
       
    }else{
        public_key = keyring.decodeAddress(from)
        
    }
     
    switch (to) {
        case 'public_key': {
            return u8aToHex(public_key)
        }
        case 'substrate': {
            return keyring.encodeAddress(public_key, 42) 
        }
        case 'relay':{
            return keyring.encodeAddress(public_key, 0) 
        }
    }
}