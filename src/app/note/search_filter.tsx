//
import { VT323 } from "@next/font/google";
const vt322 = VT323({ subsets: ["latin"], weight: ["400"] });

import Image from "next/image";
import { Suspense, use } from "react";

// export const FilterWrapper = ({ pokiCount }) => {
//     const url = `https://pokeapi.co/api/v2/pokemon?&limit=${pokiCount}`;
//     const req = fetch(url);
//     req.then((data) => {
//         console.log("RIZ", data.json());
//     });
//     console.log("RIZ", req);
//     return <h1>from server {pokiCount}</h1>;
// };

const ImgSprite = ({
    name,
    scale,
    pokiInfo,
    initial = 100,
}: {
    name: string;
    scale: number;
    pokiInfo: any;
    initial?: number;
}) => {
    const store = pokiInfo;
    const dim = scale * initial;
    // const link = store ? store["sprites"]["front_default"] : "";
    interface spriteVersion {
        [key: string]: Object;
    }
    const select_gen = (sprites: { versions: spriteVersion }, gen: string) => {
        return sprites.versions[gen];
    };

    const select_gen_type = (
        gens: Object,
        gtype: string,
        pos: string,
        isAnimated: boolean
    ) => {
        const _gt: { animated?: Object } = gens[gtype];
        console.log("GENKO", _gt, gens, gtype);
        return isAnimated ? _gt["animated"][pos] : _gt[pos];
    };

    const position = "front_default";
    const preDefinedPos = [
        "front_default",
        "back_default",
        "back_shiny",
        "front_shiny",
    ];

    let link = store
        ? select_gen_type(
            select_gen(store["sprites"], "generation-v"),
            "black-white",
            position,
            true
        )
        : "";

    console.log("PO_F", pokiInfo, link == null);
    if (link === null) {
        // do sth with null recovery
        // link = pokiInfo["sprites"];
        const sprites = pokiInfo["sprites"];
        for (const spritePos of preDefinedPos) {
            const _available = sprites[spritePos];
            if (_available !== null) {
                link = _available;
            }
        }
        if (link === null) {
            // if still null will start searching in { other catalog(dream-world,home,official-artwork) }
            const otherCatalog = sprites["other"];
            const otherCatalogKeys = ["dream_world", "home", "official-artwork"];
            otherCatalogKeys.forEach((catalog) => {
                const inner_position = otherCatalog[catalog];
                Object.keys(inner_position).forEach((pos) => {
                    if (inner_position[pos] !== null) {
                        link = inner_position[pos];
                        return;
                    }
                });
            });
            console.log("BRUH", pokiInfo);
        }
    }
    return link !== "" || link !== null ? (
        <Image src={`${link}`} alt={`${name}`} width={dim} height={dim} />
    ) : (
        <h1>loading image...</h1>
    );
};

const PokiInfoCard = ({ name, pokiInfo, query }) => {
    if (!pokiInfo) {
        return <h1>loading info...</h1>;
    }

    console.log("POKIA", pokiInfo);
    return (
        <div
            key={name}
            className={`bg-white p-2 py-5 rounded-2xl flex 
                hover:scale-105 duration-100
                h-full
                flex-col justify-between items-center shadow border-2 
                shadow-slate-800 ${vt322.className}`}
        >
            <ImgSprite pokiInfo={pokiInfo} name={name} scale={1.2} />
            {query !== "" ? (
                <div className="flex">
                    <h1 className="text-red-500">{name.substr(0, query.length)}</h1>
                    <h1>{name.substr(query.length)}</h1>
                </div>
            ) : (
                <h1 className={`py-1`}>{name}</h1>
            )}

            <div className="border w-1/2 m-2"></div>
            <div className="stats-showcase ">
                {pokiInfo.stats.map((statInfo: PokiStatInfo) => {
                    const base_value = statInfo.base_stat;
                    const stat_type = statInfo.stat.name;
                    return (
                        <div key={stat_type} className="flex w-full justify-center">
                            <div className="aa flex">
                                <p className="uppercase">{stat_type} </p> : {base_value}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="border w-1/2 m-2"></div>
            <h1 className="text-slate-500">base xp : {pokiInfo.base_experience}</h1>
            <div className="border w-1/3 m-2"></div>
            <h2 className="text-slate-500">Supported Abilities : </h2>
            {pokiInfo.abilities.map((ability_stat) => {
                const ability = ability_stat["ability"];
                return (
                    <div key={ability.name} className="ability-stat text-orange-400">
                        <h1>{ability.name}</h1>
                    </div>
                );
            })}
        </div>
    );
};

const FilterFn = async ({ filtered, pokiCount }) => {
    if (filtered.length > 0) return filtered;
    const url = `https://pokeapi.co/api/v2/pokemon?&limit=${pokiCount}`;
    const req = await fetch(url);

    const data = await req.json();
    return data.results;
    // const fetch(url);
};
// export const FilterWrapper = ({ filtered, pokiCount }) => {
//     return (
//         <Suspense>
//             <FilterFn filtered pokiCount />
//         </Suspense>
//     );
// };

const cachingStore = {
    cached: {},
};
export const FilterWrapper = ({ filtered, pokiCount, pokiInfo, query }) => {
    let res = filtered.filter((res) => {
        if (query === "") return true;
        return res.name.startsWith(query);
    });

    if (res.length === 0) {
        filtered = use(FilterFn({ filtered: res, pokiCount }));
        res = filtered.filter((res) => {
            if (query === "") return true;
            return res.name.startsWith(query);
        });
    }
    // use(
    //     (async () => {
    //         console.log("HELLo");
    //     })()
    // );

    // const filteredSearch = use(FilterFn({ filtered: res, pokiCount }));
    const filteredSearch = res;
    console.log("FILT IL", filteredSearch);

    return filteredSearch.map((pokimon) => {
        const info = pokiInfo[pokimon.name];
        return (
            <div key={pokimon.name}>
                <PokiInfoCard
                    key={pokimon.name}
                    name={pokimon.name}
                    pokiInfo={info}
                    query={query}
                />
            </div>
        );
    });
};

// {data
//     ? filterSearch(data.results).map((pokimon: any) => {
//         return (
//             <PokiInfoCard
//                 key={pokimon.name}
//                 name={pokimon.name}
//                 pokiInfo={fullPokemonInfo[pokimon.name]}
//                 query={query}
//             />
//         );
//     })
//     : ""}
//
//
// <PokimonCardPanel
//     filtered={filterSearch(data.results)}
//     query={query}
//     pokiInfo={fullPokemonInfo}
// />
