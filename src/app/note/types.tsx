interface PokiInfoType { }

interface PokiCardProps {
    name: string;
    query: string;
    // pokiInfo:c
}

interface StatType {
    name: string;
    url: string;
}

interface PokiStatInfo {
    base_stat: number;
    effort: 0;
    stat: StatType;
}
