import React, { useState } from "react";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { FeedbackType, TactFile } from './Interfaces';

type State = {
  files: TactFile[];
  suffix: string;
}

const mapping = [
  3, 2, 1, 0,
  7, 6, 5, 4,
  11, 10, 9, 8,
  15, 14, 13, 12,
  19, 18, 17, 16,
];

const mirrorVestIndex = (index: number) => {
  return mapping[index];
};

const mirrorVest = (effect: any) => {
  const dotFeedback = effect.dotMode.feedback.map((f: any) => {
      if (!f.pointList) {
        return f;
      }
      return ({
        ...f,
        pointList: f.pointList.map((p: any) => {
          return {
            ...p,
            index: mirrorVestIndex(p.index),
          };
        })
      })
  });

  const pathFeedback = effect.pathMode.feedback.map((f: any) => {
    return {
      ...f,
      pointList: f.pointList.map((p: any) => {
        return {
          ...p,
          x: (1 - parseFloat(p.x)).toFixed(3),
        };
      })
    }
  });

  return {
    ...effect,
    dotMode: {
      ...effect.dotMode,
      feedback: dotFeedback,
    },
    pathMode: {
      ...effect.pathMode,
      feedback: pathFeedback,
    }
  }
};

export default () => {
  const[state, setState] = useState<State>({
    files: [],
    suffix: '_Mirror',
  });

  return (
    <div>
      <div>
        <input
          type={'file'}
          multiple={true}
          accept=".tact"
          onChange={(e) => {
            if (!e.target.files) {
              return;
            }

            const files: TactFile[] = [];

            const size = e.target.files.length;
            let count = 0;
            for (let i = 0; i < size; i++) {
              const file = e.target.files[i];
              const fileReader = new FileReader();
              fileReader.onloadend = (e) => {
                const content = fileReader.result;
                count++;
                if (typeof content !== 'string') {
                  return;
                }

                let tactFile = JSON.parse(content);

                let fileType = tactFile.project.layout.name;
                let type = FeedbackType.Unknown;
                if (fileType === 'Vest' || fileType === 'Tactot') {
                  type = FeedbackType.Vest;
                } else if (fileType.startsWith('Tactosy')) {
                  type = FeedbackType.Arm;
                } else if (fileType.startsWith('Hand')) {
                  type = FeedbackType.Hand;
                } else if (fileType.startsWith('Foot')) {
                  type = FeedbackType.Foot;
                }

                const converted = {
                  ...tactFile,
                  project: {
                    ...tactFile.project,
                    tracks: tactFile.project.tracks.map((track: any) => {

                      let newT = {
                        ...track,
                        effects: track.effects.map((effect: any) => {

                          const keys = Object.keys(effect.modes);
                          let tmp1 = keys[0];
                          let tmp2 = keys[1];
                          if (type === FeedbackType.Foot || type === FeedbackType.Hand || type === FeedbackType.Arm) {

                            return ({
                              ...effect,
                              modes: {
                                [tmp1]: effect.modes[tmp2],
                                [tmp2]: effect.modes[tmp1],
                              }
                            })
                          } else if(type === FeedbackType.Vest) {
                            return ({
                              ...effect,
                              modes: {
                                [tmp1]: mirrorVest(effect.modes[tmp1]),
                                [tmp2]: mirrorVest(effect.modes[tmp2]),
                              }
                            })
                          }


                          return ({...effect})
                        })
                      };

                      return {
                        ...newT
                      };
                    })
                  }
                };


                files.push({
                  fileName: file.name,
                  type,
                  content: JSON.stringify(converted),
                });


                if (count === size) {
                  setState({...state, files});
                }
              };
              fileReader.readAsText(file);
            }

          }}
        />

        <label>Suffix : </label>
        <input
          className={'border rounded'}
          value={state.suffix}
          onChange={e => {
            setState({...state, suffix: e.target.value});
          }}
          type={'text'} />

        <button
          className={'border rounded mx-2 px-4 py-2 bg-blue-500'}
          onClick={async () => {
            if (state.files.length === 0) {
              return;
            }

            const zip = new JSZip();
            state.files.forEach(m => {
              zip.file(m.fileName.replace(".tact", "") + state.suffix + ".tact", m.content);
            });
            const ars = await zip.generateAsync({type : "blob"});
            const file = new File([ars], 'Mirror.zip', {type: "application/zip;charset=utf-8"});
            saveAs(file);
          }}>
          Download converted files
        </button>
      </div>

      <div>
        {state.files.map((f => {
          return (
            <div key={f.fileName} className={'my-2 border-b rounded'}>
              <div>
                {f.fileName}
                <label className={'mx-2'}>
                  {f.type}
                </label>
              </div>
            </div>
          )
        }))}
        <div></div>
      </div>
    </div>
  );
}
