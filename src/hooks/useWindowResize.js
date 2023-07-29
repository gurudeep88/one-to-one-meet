import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function useWindowResize(participantCount){

        let documentWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        let documentHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        if(participantCount ===1){
            return {
                viewportWidth: (documentHeight - 92) * 16/9,
                viewportHeight: documentHeight - 92
            }
        }
        return {
            viewportWidth: documentWidth / participantCount,
            viewportHeight: documentHeight - 92
        }
}