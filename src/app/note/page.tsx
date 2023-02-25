"use client";
import { url } from "inspector";
import Image from "next/image";
import { VT323 } from "@next/font/google";
import { FilterWrapper as PokimonCardPanel } from "./search_filter";
import {
    useMemo,
    useState,
    FunctionComponent,
    Dispatch,
    SetStateAction,
    useRef,
} from "react";
import { useQueries, useQuery } from "react-query";
type url = String;

interface PokiUrlInfo {
    url: url;
    name: String;
}

const vt322 = VT323({ subsets: ["latin"], weight: ["400"] });

interface PokiRequestInfo {
    count: number;
    results: Array<string>;
    next: url;
    previous: url;
}

const usePokeFullInfo = (
    pokePartialInfo: Array<PokiUrlInfo>,
    stopCode: number
) => {
    const pokemonQueryResults = useQueries(
        pokePartialInfo
            .slice(0, stopCode ? stopCode : -1)
            .map((result: PokiUrlInfo) => {
                return {
                    queryKey: ["pokemon-info", result.name],
                    queryFn: async () => {
                        const u: URL = new URL(`${result.url}`);
                        const res = await fetch(u);
                        const data = res.json();
                        data["name"] = result.name;
                        return data;
                    },
                    options: {
                        enabled: result !== undefined && pokePartialInfo,
                        keepPreviousData: true,
                    },
                };
            })
    );

    const fullPokemonInfo = {};
    pokemonQueryResults.forEach((q) => {
        const eachInfo = q.data;
        if (eachInfo) {
            fullPokemonInfo[eachInfo.name] = eachInfo;
        }
    });
    return fullPokemonInfo;
};

function _pipe<initialInput, initialOutput, pipeOut>(
    _funcA: (arg: initialInput) => initialOutput,
    _funcB: (arg2: initialOutput) => pipeOut
) {
    return function(arg: initialInput): pipeOut {
        return _funcB(_funcA(arg));
    };
}

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

// Refactored
const pipe = (...ops: Function[]) => ops.reduce(_pipe);
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

let chunkSize = 10;
let stopCode = 10;
export default function NotePage() {
    // const [bucketStep, setBucketStep] = useState(0);
    console.log("RERENDERED", chunkSize, stopCode);
    const searchInputRef = useRef();

    // const [stopCode, setStopCode] = useState(-1);
    const [bucketStep, setBucketStep] = useState(0);
    const [query, setQuery] = useState("");
    const { data, isLoading, refetch } = useQuery(
        ["poki-list", bucketStep],
        async () => {
            const url = `https://pokeapi.co/api/v2/pokemon?offset=${chunkSize * 2 * bucketStep
                }&limit=${chunkSize}`;

            const res = await fetch(url);

            return res.json();
        },
        {
            keepPreviousData: true,
        }
    );

    const pokePartialInfo = data ? data.results : [];
    const pokiCount = data ? data.count : 100;

    const fullPokemonInfo = usePokeFullInfo(pokePartialInfo, 20);

    console.log(fullPokemonInfo);
    const count = data ? data.count : 0;

    const totalPage = useMemo(() => {
        const totalPages = count / (chunkSize * 2);
        console.log(count, chunkSize, totalPages);
        return Math.ceil(totalPages);
    }, [count]);

    if (isLoading) return <h1> Loading</h1>;

    const filterSearch = (results: Array<PokiUrlInfo>) => {
        const res = results.filter((res: PokiUrlInfo) => {
            if (query === "") return true;
            return res.name.startsWith(query);
        });
        if (res.length === 0) {
            stopCode = 20;
            refetch();
            // setBucketStep(0);
            chunkSize = 100;
        }
        return res;
    };

    return (
        <div className="p-4 flex flex-col border-black m-4 rounded-lg bg-gray-100 ">
            <h1 className="text-xl lg:text-4xl font-bold uppercase m-5">
                Pokimon Codex
            </h1>
            <div
                className="flex justify-center lg:justify-start m-4  focus:ring-blue-500 group "
                onClick={() => {
                    searchInputRef.current.focus();
                }}
            >
                <div
                    className="border border-black rounded-lg flex justify-between items-center shadow-lg bg-white
                focus:outline-blue-400 group-hover:border-blue-500 w-1/3"
                >
                    <div className="flex">
                        <div className="m-2 group-hover:text-blue-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                            </svg>
                        </div>
                        <input
                            type="text"
                            ref={searchInputRef}
                            className=" px-2 py-1 mr-2 outline-none "
                            placeholder="Search pokimon abilities"
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button className="text-xs px-2.5 py-2 text-white bg-blue-500 rounded-lg m-1 shadow">
                        Search
                    </button>
                </div>
            </div>
            <div className="p-2 grid grid-cols-scalable-grid gap-10 grid-flow-row auto-rows-max">
                {
                    data
                        ? filterSearch(data.results).map((pokimon: any) => {
                            return (
                                <PokiInfoCard
                                    key={pokimon.name}
                                    name={pokimon.name}
                                    pokiInfo={fullPokemonInfo[pokimon.name]}
                                    query={query}
                                />
                            );
                        })
                        : ""
                    // <PokimonCardPanel
                    //     filtered={data.results}
                    //     query={query}
                    //     pokiInfo={fullPokemonInfo}
                    //     pokiCount={pokiCount}
                    // />
                }
            </div>

            <div className="my-5 self-center">
                <PaginationFoot
                    totalPage={totalPage}
                    bucketStep={bucketStep}
                    setBucketStep={setBucketStep}
                />
            </div>
        </div>
    );
}

interface PaginationFootProps {
    totalPage: number;
    bucketStep: number;
    setBucketStep: Dispatch<SetStateAction<number>>;
}

const pokiFilter = () => {
    return <div></div>;
};

const PaginationFoot: FunctionComponent<PaginationFootProps> = ({
    totalPage,
    bucketStep,
    setBucketStep,
}) => {
    const back = () => {
        setBucketStep((s: number) => s - 1);
    };
    // const [currPage ,]
    const next = () => setBucketStep((s: number) => s + 1);

    const maxPageNum = 5;
    const isFirstPage = bucketStep === 0;
    const isLastPage = totalPage - 1 === bucketStep;
    // const shift = bucketStep - maxPageNum > ? bucketStep : 0;
    const currPaginationPage = Math.abs((bucketStep + maxPageNum) / maxPageNum);

    const shift = Math.floor(currPaginationPage);
    const determinePageNumbers = () => {
        return totalPage > maxPageNum
            ? shift * maxPageNum > totalPage
                ? Math.abs(totalPage - shift * maxPageNum) + 1
                : maxPageNum
            : totalPage;
    };

    return (
        <div className="flex gap-3">
            <button
                className={`${isFirstPage ? "text-slate-500" : ""}`}
                onClick={() => back()}
                disabled={isFirstPage}
            >
                back
            </button>
            {isLastPage ? (
                <div className="flex -mr-2">
                    <button
                        className={`px-2 rounded-lg m-1 text-white ${bucketStep === 0 ? "bg-red-500" : "bg-green-500"
                            }`}
                        onClick={() => setBucketStep(0)}
                    >
                        1
                    </button>
                    <h1>...</h1>
                </div>
            ) : (
                ""
            )}

            <div className="flex">
                {Array(determinePageNumbers())
                    .fill(shift)
                    .map((shiftNum, i) => {
                        const count = (shiftNum - 1) * maxPageNum + i + 1;
                        return (
                            <button
                                className={`px-2 rounded-lg m-1 text-white ${count - 1 === bucketStep ? "bg-red-500" : "bg-green-500"
                                    }
                                `}
                                key={i}
                                onClick={() => setBucketStep(count - 1)}
                            >
                                <h1>{count}</h1>
                            </button>
                        );
                    })}
                <h1>...</h1>
                <button
                    className={`px-2 rounded-lg m-1 text-white ${totalPage === bucketStep + 1 ? "bg-red-500" : "bg-green-500"
                        }
                https://pokeapi.co/api/v2/pokimon?offset=20&limit=10                `}
                    onClick={() => setBucketStep(totalPage - 3)}
                >
                    <h1>{totalPage - 3}</h1>
                </button>
            </div>
            <button
                className={`${isLastPage ? "text-slate-500" : ""}`}
                onClick={() => next()}
                disabled={isLastPage}
            >
                next
            </button>
        </div>
    );
};

// PaginationFoot.PropTypes = {};
