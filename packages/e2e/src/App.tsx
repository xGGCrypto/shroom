import * as React from "react";

import { CaretDown } from "./CaretDown";
import { TestMap } from "./TestMap";

import { TestRendererContent } from "./TestRendererContent";
import { tests } from "./tests";

const hashString = decodeURIComponent(window.location.hash).slice(1);
const hashParts = hashString.split("|");
const active = hashParts[0].split("/");
const onlyContent = hashParts[1] != null && hashParts[1] === "1";

export function App() {
  const [state, setState] = React.useState<{
    active: string[];
    onlyContent: boolean;
  }>({
    onlyContent: onlyContent,
    active: active,
  });

  React.useEffect(() => {
    let str = `#${state.active.join("/")}`;
    if (state.onlyContent) {
      str += `|1`;
    }

    window.location.hash = str;
  }, [state.active, state.onlyContent]);

  if (state.onlyContent) {
    return (
      <div className="FullScreen">
        <TestRendererContent keys={state.active} />
      </div>
    );
  }

  return (
    <div className="Content">
      <div className="LeftNavigation">
        <SubNavigation
          map={tests}
          level={0}
          keys={[]}
          onClick={(keys) => {
            setState((prev) => ({ ...prev, active: keys }));
          }}
          activeKeys={state.active}
        />
      </div>

      <TestRendererContent keys={state.active} />
    </div>
  );
}

function SubNavigation({
  map,
  level,
  keys,
  activeKeys,
  onClick,
}: {
  map: TestMap;
  level: number;
  keys: string[];
  activeKeys: string[];
  onClick: (keys: string[]) => void;
}): JSX.Element {
  const innerElements = (
    <>
      {Object.keys(map).map((key) => {
        const ownKeys = [...keys, key];

        const value = map[key];

        if (typeof value === "object") {
          return (
            <Group
              name={key}
              key={key+ Math.random()}
              activeKeys={activeKeys}
              level={level}
              onClick={onClick}
              ownKeys={ownKeys}
              value={value}
            />
          );
        } else {
          return (
            <div className={`Title ${ownKeys.join(",") === activeKeys.join(",") ? "activeCss" : ""}`}
              onClick={() => onClick(ownKeys)}
              key={key+ Math.random()}
              style={{ marginLeft: level * 16 }}
            >
              {key}
            </div>
          );
        }
      })}
    </>
  );

  return innerElements;
}

export function Group({
  name,
  level,
  value,
  onClick,
  ownKeys,
  activeKeys,
}: {
  level: number;
  name: string;
  value: TestMap;
  onClick: (keys: string[]) => void;
  activeKeys: string[];
  ownKeys: string[];
}) {
  const [open, setOpen] = React.useState<boolean>(false);

  const content = (
    <div style={{ marginLeft: level * 16 }}>
      <div className={`Title ${open ? "activeCss" : ""}`}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        {name}

        <div className="Icon" style={{transform: `rotateZ(${open ? "0" : "-90"}deg)`}}>
          <CaretDown />
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 8 }}>
          <SubNavigation
            map={value}
            level={level + 1}
            onClick={onClick}
            keys={ownKeys}
            activeKeys={activeKeys}
          />
        </div>
      )}
    </div>
  );

  if (level === 0) {
    return <div className="Level0Box">{content}</div>;
  }

  return content;
}